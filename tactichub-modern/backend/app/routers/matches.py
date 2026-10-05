from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import MatchRequest, MatchParticipant, PlayerProfile, User
from ..schemas import MatchRequestCreate, MatchRequestResponse
from ..auth import get_current_user, get_current_player

router = APIRouter(prefix="/api/matches", tags=["Matchmaking & LFG"])

@router.post("/", response_model=MatchRequestResponse)
def create_match_request(
    req: MatchRequestCreate,
    player: PlayerProfile = Depends(get_current_player),
    db: Session = Depends(get_db)
):
    match = MatchRequest(
        host_player_id=player.id,
        sport=req.sport.strip(),
        location_name=req.location_name.strip(),
        start_time=req.start_time.strip(),
        slots_total=req.slots_total,
        slots_filled=1,  # Host occupies slot 1
        skill_level=req.skill_level,
        notes=req.notes,
        status="OPEN"
    )
    db.add(match)
    db.flush()

    # Add host as participant
    participant = MatchParticipant(match_id=match.id, player_id=player.id)
    db.add(participant)
    db.commit()
    db.refresh(match)

    return {
        "id": match.id,
        "sport": match.sport,
        "location_name": match.location_name,
        "start_time": match.start_time,
        "slots_total": match.slots_total,
        "slots_filled": match.slots_filled,
        "skill_level": match.skill_level,
        "notes": match.notes,
        "status": match.status,
        "host_username": player.user.username,
        "host_team": player.team,
        "created_at": match.created_at,
        "is_host": True,
        "has_joined": True
    }

@router.get("/", response_model=List[MatchRequestResponse])
def get_match_requests(
    sport: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(MatchRequest).join(PlayerProfile).join(User)

    if sport:
        query = query.filter(MatchRequest.sport.ilike(f"%{sport}%"))
    if status:
        query = query.filter(MatchRequest.status == status)

    matches = query.order_by(MatchRequest.created_at.desc()).all()

    current_player_id = None
    if current_user and current_user.role == "PLAYER" and current_user.player_profile:
        current_player_id = current_user.player_profile.id

    results = []
    for m in matches:
        is_host = current_player_id == m.host_player_id
        has_joined = any(p.player_id == current_player_id for p in m.participants) if current_player_id else False

        results.append({
            "id": m.id,
            "sport": m.sport,
            "location_name": m.location_name,
            "start_time": m.start_time,
            "slots_total": m.slots_total,
            "slots_filled": m.slots_filled,
            "skill_level": m.skill_level,
            "notes": m.notes,
            "status": m.status,
            "host_username": m.host_player.user.username,
            "host_team": m.host_player.team,
            "created_at": m.created_at,
            "is_host": is_host,
            "has_joined": has_joined
        })

    return results

@router.post("/{match_id}/join")
def join_match(
    match_id: str,
    player: PlayerProfile = Depends(get_current_player),
    db: Session = Depends(get_db)
):
    match = db.query(MatchRequest).filter(MatchRequest.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.status != "OPEN" or match.slots_filled >= match.slots_total:
        raise HTTPException(status_code=400, detail="Match is already full or closed")

    # Check if already joined
    existing = db.query(MatchParticipant).filter(
        MatchParticipant.match_id == match_id,
        MatchParticipant.player_id == player.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already joined this match")

    participant = MatchParticipant(match_id=match.id, player_id=player.id)
    db.add(participant)
    match.slots_filled += 1
    if match.slots_filled >= match.slots_total:
        match.status = "FULL"

    db.commit()
    return {"message": "Successfully joined the match", "slots_filled": match.slots_filled, "status": match.status}

@router.post("/{match_id}/leave")
def leave_match(
    match_id: str,
    player: PlayerProfile = Depends(get_current_player),
    db: Session = Depends(get_db)
):
    match = db.query(MatchRequest).filter(MatchRequest.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.host_player_id == player.id:
        raise HTTPException(status_code=400, detail="Host cannot leave match; cancel it instead")

    participant = db.query(MatchParticipant).filter(
        MatchParticipant.match_id == match_id,
        MatchParticipant.player_id == player.id
    ).first()
    if not participant:
        raise HTTPException(status_code=400, detail="You are not part of this match")

    db.delete(participant)
    match.slots_filled = max(1, match.slots_filled - 1)
    if match.status == "FULL":
        match.status = "OPEN"

    db.commit()
    return {"message": "Left match successfully", "slots_filled": match.slots_filled, "status": match.status}

@router.delete("/{match_id}")
def cancel_match(
    match_id: str,
    player: PlayerProfile = Depends(get_current_player),
    db: Session = Depends(get_db)
):
    match = db.query(MatchRequest).filter(MatchRequest.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.host_player_id != player.id:
        raise HTTPException(status_code=403, detail="Only host can cancel match")

    match.status = "CANCELLED"
    db.commit()
    return {"message": "Match request cancelled"}
