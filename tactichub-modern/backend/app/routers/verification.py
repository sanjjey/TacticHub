from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import uuid
from pathlib import Path
from ..database import get_db
from ..models import CoachProfile, VerificationAudit, Certificate
from ..schemas import VerificationResultResponse
from ..auth import get_current_coach
from ..cv_verifier import cv_verifier
from ..config import UPLOAD_DIR

router = APIRouter(prefix="/api/verification", tags=["Computer Vision AI Verification"])

@router.post("/verify-document", response_model=VerificationResultResponse)
async def verify_coach_document(
    document: UploadFile = File(...),
    document_title: str = Form("Coaching Credential / Degree"),
    coach: CoachProfile = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    if not document.filename:
        raise HTTPException(status_code=400, detail="Document file is required")

    file_ext = Path(document.filename).suffix.lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        raise HTTPException(status_code=400, detail="Please upload an image document (.jpg, .png, .webp)")

    safe_filename = f"verify_{uuid.uuid4()}{file_ext}"
    destination = UPLOAD_DIR / safe_filename

    with destination.open("wb") as buffer:
        shutil.copyfileobj(document.file, buffer)

    # Run Computer Vision AI Document Inspection Pipeline
    coach_name = coach.user.full_name or coach.user.username
    org_name = coach.organization_name or ""
    
    cv_result = cv_verifier.analyze_document(
        image_path=str(destination),
        coach_name=coach_name,
        organization_name=org_name
    )

    # Audit log entry
    audit = VerificationAudit(
        coach_id=coach.id,
        document_path=f"/uploads/{safe_filename}",
        extracted_text=cv_result.get("extracted_text", ""),
        matched_name=cv_result.get("matched_name"),
        confidence_score=cv_result.get("confidence_score", 0.0),
        status=cv_result.get("status", "REJECTED"),
        details=cv_result.get("details", "")
    )
    db.add(audit)

    # If verification succeeds, update coach profile status & add to verified certificates
    if cv_result["status"] == "VERIFIED":
        coach.verification_status = "VERIFIED"
        verified_cert = Certificate(
            user_id=coach.user_id,
            title=document_title,
            issuing_body=org_name or "Verified Sports Organization",
            cert_type="COACHING_LICENSE",
            file_url=f"/uploads/{safe_filename}",
            is_verified=True
        )
        db.add(verified_cert)
    elif cv_result["status"] == "FLAGGED":
        coach.verification_status = "FLAGGED"

    db.commit()
    db.refresh(audit)

    return {
        "audit_id": audit.id,
        "status": audit.status,
        "confidence_score": audit.confidence_score,
        "matched_name": audit.matched_name,
        "extracted_text_preview": audit.extracted_text or "No text recognized",
        "details": audit.details or "",
        "is_verified": audit.status == "VERIFIED"
    }

@router.get("/history")
def get_verification_history(
    coach: CoachProfile = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    audits = db.query(VerificationAudit).filter(
        VerificationAudit.coach_id == coach.id
    ).order_by(VerificationAudit.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "document_path": a.document_path,
            "matched_name": a.matched_name,
            "confidence_score": a.confidence_score,
            "status": a.status,
            "details": a.details,
            "created_at": a.created_at
        }
        for a in audits
    ]
