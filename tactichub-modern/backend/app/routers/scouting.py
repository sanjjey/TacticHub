from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import PlayerProfile, CoachProfile, User, Certificate, RecruitmentInvite
from ..schemas import ScoutPlayerResponse, RecruitmentInviteCreate, RecruitmentInviteResponse
from ..auth import get_current_user, get_current_coach, get_current_player

router = APIRouter(prefix="/api/scouting", tags=["Scouting & Recruitment"])

@router.get("/players", response_model=List[ScoutPlayerResponse])
def get_scoutable_players(
    sport: Optional[str] = Query(None),
    coach: CoachProfile = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    # Enforce rule: only return players with coach_visibility == True
    query = db.query(PlayerProfile).join(User).filter(PlayerProfile.coach_visibility == True)

    if sport:
        query = query.filter(PlayerProfile.primary_sport.ilike(f"%{sport}%"))

    players = query.all()
    results = []
    for p in players:
        cert_count = db.query(Certificate).filter(Certificate.user_id == p.user_id).count()
        results.append({
            "player_id": p.id,
            "username": p.user.username,
            "full_name": p.user.full_name,
            "age": p.user.age,
            "primary_sport": p.primary_sport,
            "team": p.team,
            "bio": p.bio,
            "certificates_count": cert_count
        })
    return results

@router.get("/players/{player_id}")
def get_player_scout_detail(
    player_id: str,
    coach: CoachProfile = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    player = db.query(PlayerProfile).filter(PlayerProfile.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Strict check on player visibility setting
    if not player.coach_visibility:
        raise HTTPException(
            status_code=403,
            detail="This player has disabled Coach Visibility. Profile cannot be reviewed."
        )

    certs = db.query(Certificate).filter(Certificate.user_id == player.user_id).all()

    return {
        "player_id": player.id,
        "username": player.user.username,
        "full_name": player.user.full_name,
        "age": player.user.age,
        "primary_sport": player.primary_sport,
        "team": player.team,
        "bio": player.bio,
        "coach_visibility": player.coach_visibility,
        "certificates": [
            {
                "id": c.id,
                "title": c.title,
                "issuing_body": c.issuing_body,
                "issue_date": c.issue_date,
                "cert_type": c.cert_type,
                "is_verified": c.is_verified
            }
            for c in certs
        ]
    }

@router.post("/invite", response_model=RecruitmentInviteResponse)
def send_recruitment_invite(
    req: RecruitmentInviteCreate,
    coach: CoachProfile = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    player = db.query(PlayerProfile).filter(PlayerProfile.id == req.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Target player not found")

    # Critical gate: check player coach_visibility
    if not player.coach_visibility:
        raise HTTPException(
            status_code=403,
            detail="Cannot send invite: Player has disabled coach visibility."
        )

    # Check if duplicate pending invite exists
    existing = db.query(RecruitmentInvite).filter(
        RecruitmentInvite.coach_id == coach.id,
        RecruitmentInvite.player_id == player.id,
        RecruitmentInvite.status == "PENDING"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending invite sent to this player")

    invite = RecruitmentInvite(
        coach_id=coach.id,
        player_id=player.id,
        message=req.message.strip(),
        status="PENDING"
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    return {
        "id": invite.id,
        "coach_name": coach.user.username,
        "coach_organization": coach.organization_name,
        "coach_verified": coach.verification_status == "VERIFIED",
        "player_name": player.user.username,
        "message": invite.message,
        "status": invite.status,
        "created_at": invite.created_at
    }

@router.get("/my-invites", response_model=List[RecruitmentInviteResponse])
def get_my_invites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PLAYER" and current_user.player_profile:
        invites = db.query(RecruitmentInvite).filter(
            RecruitmentInvite.player_id == current_user.player_profile.id
        ).order_by(RecruitmentInvite.created_at.desc()).all()
    elif current_user.role == "COACH" and current_user.coach_profile:
        invites = db.query(RecruitmentInvite).filter(
            RecruitmentInvite.coach_id == current_user.coach_profile.id
        ).order_by(RecruitmentInvite.created_at.desc()).all()
    else:
        invites = []

    return [
        {
            "id": inv.id,
            "coach_name": inv.coach.user.username,
            "coach_organization": inv.coach.organization_name,
            "coach_verified": inv.coach.verification_status == "VERIFIED",
            "player_name": inv.player.user.username,
            "message": inv.message,
            "status": inv.status,
            "created_at": inv.created_at
        }
        for inv in invites
    ]

@router.put("/invites/{invite_id}/respond")
def respond_to_invite(
    invite_id: str,
    action: str = Query(..., pattern="^(ACCEPTED|DECLINED)$"),
    player: PlayerProfile = Depends(get_current_player),
    db: Session = Depends(get_db)
):
    invite = db.query(RecruitmentInvite).filter(
        RecruitmentInvite.id == invite_id,
        RecruitmentInvite.player_id == player.id
    ).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Recruitment invite not found")

    invite.status = action
    db.commit()
    return {"message": f"Invite {action.lower()} successfully", "status": invite.status}
