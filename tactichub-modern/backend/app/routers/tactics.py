from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Tactic, CoachProfile, User
from ..schemas import TacticCreate, TacticResponse
from ..auth import get_current_user, get_current_coach

router = APIRouter(prefix="/api/tactics", tags=["Tactics"])

@router.post("/", response_model=TacticResponse)
def create_tactic(
    req: TacticCreate,
    coach: CoachProfile = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    new_tactic = Tactic(
        coach_id=coach.id,
        game=req.game.strip(),
        title=req.title.strip(),
        description=req.description.strip()
    )
    db.add(new_tactic)
    db.commit()
    db.refresh(new_tactic)

    return {
        "id": new_tactic.id,
        "game": new_tactic.game,
        "title": new_tactic.title,
        "description": new_tactic.description,
        "coach_name": coach.user.username,
        "coach_organization": coach.organization_name,
        "is_coach_verified": coach.verification_status == "VERIFIED",
        "created_at": new_tactic.created_at
    }

@router.get("/", response_model=List[TacticResponse])
def get_tactics(
    search: Optional[str] = Query(None, description="Search query across game, title, strategy, or coach name"),
    sport: Optional[str] = Query(None, description="Filter by specific game/sport"),
    my_posts_only: bool = Query(False, description="Filter only posts created by currently logged-in coach"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Tactic).join(CoachProfile).join(User)

    if my_posts_only:
        if not current_user or current_user.role != "COACH":
            raise HTTPException(status_code=403, detail="Only coaches can view their own posts")
        query = query.filter(CoachProfile.user_id == current_user.id)

    if sport:
        query = query.filter(Tactic.game.ilike(f"%{sport}%"))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Tactic.game.ilike(search_filter)) |
            (Tactic.title.ilike(search_filter)) |
            (Tactic.description.ilike(search_filter)) |
            (User.username.ilike(search_filter))
        )

    tactics = query.order_by(Tactic.created_at.desc()).all()

    return [
        {
            "id": t.id,
            "game": t.game,
            "title": t.title,
            "description": t.description,
            "coach_name": t.coach.user.username,
            "coach_organization": t.coach.organization_name,
            "is_coach_verified": t.coach.verification_status == "VERIFIED",
            "created_at": t.created_at
        }
        for t in tactics
    ]

@router.delete("/{tactic_id}")
def delete_tactic(
    tactic_id: str,
    coach: CoachProfile = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    tactic = db.query(Tactic).filter(Tactic.id == tactic_id).first()
    if not tactic:
        raise HTTPException(status_code=404, detail="Tactic not found")
    if tactic.coach_id != coach.id:
        raise HTTPException(status_code=403, detail="You can only delete your own tactics")

    db.delete(tactic)
    db.commit()
    return {"message": "Tactic deleted successfully"}
