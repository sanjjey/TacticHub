from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, PlayerProfile, CoachProfile
from ..schemas import UserRegister, UserLogin, Token, UserProfileResponse, UpdateCredentialsRequest
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    # Check if username or email exists
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username is already taken")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Hash password
    hashed_pwd = hash_password(req.password)
    new_user = User(
        username=req.username,
        email=req.email,
        hashed_password=hashed_pwd,
        role=req.role,
        full_name=req.full_name or req.username,
        age=req.age
    )
    db.add(new_user)
    db.flush()

    if req.role == "PLAYER":
        player_prof = PlayerProfile(
            user_id=new_user.id,
            team=req.team or "Free Agent",
            primary_sport=req.primary_sport or "Football",
            coach_visibility=True
        )
        db.add(player_prof)
    elif req.role == "COACH":
        coach_prof = CoachProfile(
            user_id=new_user.id,
            organization_name=req.organization_name or "Independent Coaching",
            verification_status="UNVERIFIED"
        )
        db.add(coach_prof)

    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.username, "role": new_user.role, "id": new_user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role,
        "username": new_user.username,
        "user_id": new_user.id
    }

@router.post("/login", response_model=Token)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "user_id": user.id
    }

@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resp = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "age": current_user.age,
        "created_at": current_user.created_at,
    }
    if current_user.role == "PLAYER" and current_user.player_profile:
        resp["team"] = current_user.player_profile.team
        resp["primary_sport"] = current_user.player_profile.primary_sport
        resp["coach_visibility"] = current_user.player_profile.coach_visibility
        resp["bio"] = current_user.player_profile.bio
    elif current_user.role == "COACH" and current_user.coach_profile:
        resp["organization_name"] = current_user.coach_profile.organization_name
        resp["verification_status"] = current_user.coach_profile.verification_status
        resp["bio"] = current_user.coach_profile.bio

    return resp

@router.put("/settings", response_model=UserProfileResponse)
def update_settings(
    req: UpdateCredentialsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update Password if provided
    if req.old_password and req.new_password:
        if not verify_password(req.old_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password does not match")
        current_user.hashed_password = hash_password(req.new_password)

    # Update Username if requested
    if req.new_username and req.new_username != current_user.username:
        existing = db.query(User).filter(User.username == req.new_username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Target username already taken")
        current_user.username = req.new_username

    # Update role-specific attributes
    if current_user.role == "PLAYER" and current_user.player_profile:
        if req.coach_visibility is not None:
            current_user.player_profile.coach_visibility = req.coach_visibility
        if req.new_bio is not None:
            current_user.player_profile.bio = req.new_bio
    elif current_user.role == "COACH" and current_user.coach_profile:
        if req.new_bio is not None:
            current_user.coach_profile.bio = req.new_bio

    db.commit()
    db.refresh(current_user)
    return get_my_profile(current_user=current_user, db=db)
