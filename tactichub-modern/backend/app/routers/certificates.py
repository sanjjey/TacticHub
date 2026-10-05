from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import uuid
from pathlib import Path
from ..database import get_db
from ..models import Certificate, User
from ..schemas import CertificateResponse
from ..auth import get_current_user
from ..config import UPLOAD_DIR

router = APIRouter(prefix="/api/certificates", tags=["Certificates & Achievements"])

@router.post("/", response_model=CertificateResponse)
async def upload_certificate(
    title: str = Form(...),
    issuing_body: str = Form(...),
    cert_type: str = Form("ACHIEVEMENT"),
    issue_date: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_file_url = None
    if file and file.filename:
        file_ext = Path(file.filename).suffix
        safe_filename = f"cert_{uuid.uuid4()}{file_ext}"
        destination = UPLOAD_DIR / safe_filename
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_file_url = f"/uploads/{safe_filename}"

    cert = Certificate(
        user_id=current_user.id,
        title=title.strip(),
        issuing_body=issuing_body.strip(),
        cert_type=cert_type,
        issue_date=issue_date,
        file_url=saved_file_url,
        is_verified=False
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return {
        "id": cert.id,
        "user_id": cert.user_id,
        "title": cert.title,
        "issuing_body": cert.issuing_body,
        "issue_date": cert.issue_date,
        "cert_type": cert.cert_type,
        "file_url": cert.file_url,
        "is_verified": cert.is_verified,
        "created_at": cert.created_at
    }

@router.get("/me", response_model=List[CertificateResponse])
def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).order_by(Certificate.created_at.desc()).all()
    return certs

@router.get("/user/{user_id}", response_model=List[CertificateResponse])
def get_user_public_certificates(
    user_id: str,
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(
        Certificate.user_id == user_id
    ).order_by(Certificate.created_at.desc()).all()
    return certs

@router.delete("/{cert_id}")
def delete_certificate(
    cert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if cert.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete other user's certificate")

    db.delete(cert)
    db.commit()
    return {"message": "Certificate deleted successfully"}
