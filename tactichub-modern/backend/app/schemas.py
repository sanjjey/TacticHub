from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    user_id: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=4)
    role: str = Field(..., pattern="^(PLAYER|COACH)$")
    full_name: Optional[str] = None
    age: Optional[int] = None
    # Player specific
    team: Optional[str] = None
    primary_sport: Optional[str] = None
    # Coach specific
    organization_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    full_name: Optional[str]
    age: Optional[int]
    created_at: datetime
    # Profile extras
    team: Optional[str] = None
    primary_sport: Optional[str] = None
    coach_visibility: Optional[bool] = None
    organization_name: Optional[str] = None
    verification_status: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class UpdateCredentialsRequest(BaseModel):
    old_password: Optional[str] = None
    new_password: Optional[str] = None
    new_username: Optional[str] = None
    new_bio: Optional[str] = None
    coach_visibility: Optional[bool] = None

# Tactic Schemas
class TacticCreate(BaseModel):
    game: str
    title: str
    description: str

class TacticResponse(BaseModel):
    id: str
    game: str
    title: str
    description: str
    author_name: str
    author_role: str
    author_organization: Optional[str] = None
    is_author_verified: bool = False
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    # Backwards compatibility fields
    coach_name: Optional[str] = None
    coach_organization: Optional[str] = None
    is_coach_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# Certificate Schemas
class CertificateCreate(BaseModel):
    title: str
    issuing_body: str
    issue_date: Optional[str] = None
    cert_type: str = "ACHIEVEMENT"

class CertificateResponse(BaseModel):
    id: str
    user_id: str
    title: str
    issuing_body: str
    issue_date: Optional[str]
    cert_type: str
    file_url: Optional[str]
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Match Request Schemas
class MatchRequestCreate(BaseModel):
    sport: str
    location_name: str
    start_time: str
    slots_total: int = Field(default=2, ge=2)
    skill_level: str = "All Levels"
    notes: Optional[str] = None

class MatchRequestResponse(BaseModel):
    id: str
    sport: str
    location_name: str
    start_time: str
    slots_total: int
    slots_filled: int
    skill_level: str
    notes: Optional[str]
    status: str
    host_username: str
    host_team: Optional[str]
    created_at: datetime
    is_host: bool = False
    has_joined: bool = False

    class Config:
        from_attributes = True

# Scouting Schemas
class ScoutPlayerResponse(BaseModel):
    player_id: str
    username: str
    full_name: Optional[str]
    age: Optional[int]
    primary_sport: Optional[str]
    team: Optional[str]
    bio: Optional[str]
    certificates_count: int

class RecruitmentInviteCreate(BaseModel):
    player_id: str
    message: str

class RecruitmentInviteResponse(BaseModel):
    id: str
    coach_name: str
    coach_organization: Optional[str]
    coach_verified: bool
    player_name: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Verification Schemas
class VerificationResultResponse(BaseModel):
    audit_id: str
    status: str
    confidence_score: float
    matched_name: Optional[str]
    extracted_text_preview: str
    details: str
    is_verified: bool
