import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # 'PLAYER' or 'COACH'
    full_name = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    player_profile = relationship("PlayerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    coach_profile = relationship("CoachProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")


class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    team = Column(String(100), nullable=True)
    primary_sport = Column(String(100), nullable=True, default="General Sports")
    coach_visibility = Column(Boolean, default=True)  # if True, coaches can discover & invite
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="player_profile")
    match_requests = relationship("MatchRequest", back_populates="host_player", cascade="all, delete-orphan")
    participations = relationship("MatchParticipant", back_populates="player", cascade="all, delete-orphan")
    recruitment_invites = relationship("RecruitmentInvite", back_populates="player", cascade="all, delete-orphan")


class CoachProfile(Base):
    __tablename__ = "coach_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    organization_name = Column(String(150), nullable=True)
    verification_status = Column(String(30), default="UNVERIFIED")  # 'UNVERIFIED', 'VERIFIED', 'FLAGGED'
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="coach_profile")
    tactics = relationship("Tactic", back_populates="coach", cascade="all, delete-orphan")
    sent_invites = relationship("RecruitmentInvite", back_populates="coach", cascade="all, delete-orphan")
    audits = relationship("VerificationAudit", back_populates="coach", cascade="all, delete-orphan")


class Tactic(Base):
    __tablename__ = "tactics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id = Column(String(36), ForeignKey("coach_profiles.id"), nullable=False)
    game = Column(String(100), index=True, nullable=False)  # Sport/Game title
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    coach = relationship("CoachProfile", back_populates="tactics")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    issuing_body = Column(String(150), nullable=False)
    issue_date = Column(String(50), nullable=True)
    cert_type = Column(String(50), default="ACHIEVEMENT")  # 'DEGREE', 'TOURNAMENT_WIN', 'COACHING_LICENSE', 'ACHIEVEMENT'
    file_url = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="certificates")


class MatchRequest(Base):
    __tablename__ = "match_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    host_player_id = Column(String(36), ForeignKey("player_profiles.id"), nullable=False)
    sport = Column(String(100), index=True, nullable=False)
    location_name = Column(String(200), nullable=False)
    start_time = Column(String(100), nullable=False)
    slots_total = Column(Integer, default=2)
    slots_filled = Column(Integer, default=1)
    skill_level = Column(String(50), default="All Levels")
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="OPEN")  # 'OPEN', 'FULL', 'CANCELLED'
    created_at = Column(DateTime, default=datetime.utcnow)

    host_player = relationship("PlayerProfile", back_populates="match_requests")
    participants = relationship("MatchParticipant", back_populates="match", cascade="all, delete-orphan")


class MatchParticipant(Base):
    __tablename__ = "match_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = Column(String(36), ForeignKey("match_requests.id"), nullable=False)
    player_id = Column(String(36), ForeignKey("player_profiles.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("MatchRequest", back_populates="participants")
    player = relationship("PlayerProfile", back_populates="participations")


class RecruitmentInvite(Base):
    __tablename__ = "recruitment_invites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id = Column(String(36), ForeignKey("coach_profiles.id"), nullable=False)
    player_id = Column(String(36), ForeignKey("player_profiles.id"), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="PENDING")  # 'PENDING', 'ACCEPTED', 'DECLINED'
    created_at = Column(DateTime, default=datetime.utcnow)

    coach = relationship("CoachProfile", back_populates="sent_invites")
    player = relationship("PlayerProfile", back_populates="recruitment_invites")


class VerificationAudit(Base):
    __tablename__ = "verification_audits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id = Column(String(36), ForeignKey("coach_profiles.id"), nullable=False)
    document_path = Column(String(255), nullable=False)
    extracted_text = Column(Text, nullable=True)
    matched_name = Column(String(100), nullable=True)
    confidence_score = Column(Float, default=0.0)
    status = Column(String(30), default="PENDING")  # 'VERIFIED', 'FLAGGED', 'REJECTED'
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    coach = relationship("CoachProfile", back_populates="audits")
