from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import uuid
from pathlib import Path

from ..database import get_db
from ..models import Tactic, User, CoachProfile, PlayerProfile
from ..schemas import TacticResponse
from ..auth import get_current_user, get_current_user_optional
from ..moderator import content_moderator
from ..config import UPLOAD_DIR

router = APIRouter(prefix="/api/tactics", tags=["Tactics"])

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v"}

@router.post("/", response_model=TacticResponse)
async def create_tactic(
    game: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    media: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # AI Content Moderation: Reject NSFW words, toxicity, and nonsense/irrelevant content
    mod_result = content_moderator.moderate_tactic(
        title=title,
        description=description,
        game=game
    )
    if not mod_result["allowed"]:
        raise HTTPException(
            status_code=400,
            detail=f"AI Moderation Rejection: {mod_result['message']}"
        )

    # Process media file upload (photo or video)
    saved_media_url = None
    media_type = None

    if media and media.filename:
        file_ext = Path(media.filename).suffix.lower()
        if file_ext in IMAGE_EXTENSIONS:
            media_type = "IMAGE"
        elif file_ext in VIDEO_EXTENSIONS:
            media_type = "VIDEO"
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type ({file_ext}). Please upload an image (JPG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV)."
            )

        safe_filename = f"tactic_{uuid.uuid4()}{file_ext}"
        dest_path = UPLOAD_DIR / safe_filename
        with dest_path.open("wb") as buffer:
            shutil.copyfileobj(media.file, buffer)
        saved_media_url = f"/uploads/{safe_filename}"

    new_tactic = Tactic(
        user_id=current_user.id,
        game=game.strip(),
        title=title.strip(),
        description=description.strip(),
        media_url=saved_media_url,
        media_type=media_type
    )
    db.add(new_tactic)
    db.commit()
    db.refresh(new_tactic)

    # Resolve author metadata
    is_verified = False
    org_name = None
    if current_user.role == "COACH" and current_user.coach_profile:
        is_verified = current_user.coach_profile.verification_status == "VERIFIED"
        org_name = current_user.coach_profile.organization_name
    elif current_user.role == "PLAYER" and current_user.player_profile:
        org_name = current_user.player_profile.team

    return {
        "id": new_tactic.id,
        "game": new_tactic.game,
        "title": new_tactic.title,
        "description": new_tactic.description,
        "author_name": current_user.username,
        "author_role": current_user.role,
        "author_organization": org_name,
        "is_author_verified": is_verified,
        "media_url": new_tactic.media_url,
        "media_type": new_tactic.media_type,
        "coach_name": current_user.username,
        "coach_organization": org_name,
        "is_coach_verified": is_verified,
        "created_at": new_tactic.created_at
    }

@router.get("/", response_model=List[TacticResponse])
def get_tactics(
    search: Optional[str] = Query(None, description="Search query across game, title, strategy, or author"),
    sport: Optional[str] = Query(None, description="Filter by specific game/sport"),
    my_posts_only: bool = Query(False, description="Filter only posts created by currently logged-in user"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Tactic).join(User, Tactic.user_id == User.id)

    if my_posts_only:
        if not current_user:
            raise HTTPException(status_code=401, detail="Sign in required to view your posts")
        query = query.filter(Tactic.user_id == current_user.id)

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

    results = []
    for t in tactics:
        author = t.author
        is_verified = False
        org_name = None
        if author.role == "COACH" and author.coach_profile:
            is_verified = author.coach_profile.verification_status == "VERIFIED"
            org_name = author.coach_profile.organization_name
        elif author.role == "PLAYER" and author.player_profile:
            org_name = author.player_profile.team

        results.append({
            "id": t.id,
            "game": t.game,
            "title": t.title,
            "description": t.description,
            "author_name": author.username,
            "author_role": author.role,
            "author_organization": org_name,
            "is_author_verified": is_verified,
            "media_url": t.media_url,
            "media_type": t.media_type,
            "coach_name": author.username,
            "coach_organization": org_name,
            "is_coach_verified": is_verified,
            "created_at": t.created_at
        })

    return results

@router.delete("/{tactic_id}")
def delete_tactic(
    tactic_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tactic = db.query(Tactic).filter(Tactic.id == tactic_id).first()
    if not tactic:
        raise HTTPException(status_code=404, detail="Tactic not found")
    if tactic.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own strategies")

    db.delete(tactic)
    db.commit()
    return {"message": "Strategy deleted successfully"}
