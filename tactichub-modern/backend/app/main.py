from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .config import UPLOAD_DIR
from .database import engine, Base, SessionLocal
from .models import User, PlayerProfile, CoachProfile, Tactic, MatchRequest, MatchParticipant, Certificate
from .auth import hash_password
from .routers import auth, tactics, matches, scouting, certificates, verification, ai_text

app = FastAPI(
    title="TacticHub API",
    description="Modern Python Backend for Sports Collaboration, Matchmaking & Coach AI Verification",
    version="2.0.0"
)

# CORS setup for React Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(tactics.router)
app.include_router(matches.router)
app.include_router(scouting.router)
app.include_router(certificates.router)
app.include_router(verification.router)
app.include_router(ai_text.router)

# Ensure tables exist immediately
Base.metadata.create_all(bind=engine)

def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("[Startup] Seeding initial TacticHub demo records...")
            # Demo Coach
            coach_user = User(
                username="coach_alex",
                email="alex@tactichub.com",
                hashed_password=hash_password("coach123"),
                role="COACH",
                full_name="Coach Alex Ferguson",
                age=48
            )
            db.add(coach_user)
            db.flush()

            coach_prof = CoachProfile(
                user_id=coach_user.id,
                organization_name="Premier Football Academy",
                verification_status="VERIFIED",
                bio="UEFA Pro License coach specializing in high-press transition tactics."
            )
            db.add(coach_prof)
            db.flush()

            # Demo Player 1 (Visible)
            player_user1 = User(
                username="striker_leo",
                email="leo@tactichub.com",
                hashed_password=hash_password("player123"),
                role="PLAYER",
                full_name="Leo Martinez",
                age=22
            )
            db.add(player_user1)
            db.flush()

            player_prof1 = PlayerProfile(
                user_id=player_user1.id,
                team="Red Dragons FC",
                primary_sport="Football",
                coach_visibility=True,
                bio="Aggressive center-forward looking for 5v5 weekend games and pro coaching trials."
            )
            db.add(player_prof1)

            # Demo Player 2 (Private visibility)
            player_user2 = User(
                username="hoops_jordan",
                email="jordan@tactichub.com",
                hashed_password=hash_password("player123"),
                role="PLAYER",
                full_name="Jordan Bell",
                age=24
            )
            db.add(player_user2)
            db.flush()

            player_prof2 = PlayerProfile(
                user_id=player_user2.id,
                team="Skyline Hoops",
                primary_sport="Basketball",
                coach_visibility=False,  # Visibility disabled!
                bio="Point guard focusing on casual streetball pick-up games."
            )
            db.add(player_prof2)
            db.flush()

            # Demo Tactics
            tactic1 = Tactic(
                coach_id=coach_prof.id,
                game="Football",
                title="Gegenpressing & Counter-Attack Transition",
                description="Immediately upon ball turnover, the nearest 3 players collapse inward within 4 seconds. The wide wingers flare out to exploit inverted fullbacks."
            )
            tactic2 = Tactic(
                coach_id=coach_prof.id,
                game="Basketball",
                title="Pick & Roll with Spain Action Screen",
                description="Ball-handler uses high center screen while weak-side shooter sets back-screen on roll-man defender. Creates open corner 3 or direct lob."
            )
            db.add_all([tactic1, tactic2])

            # Demo Match Request
            match1 = MatchRequest(
                host_player_id=player_prof1.id,
                sport="Football 5-a-side",
                location_name="Downtown Turf Arena, Pitch 3",
                start_time="Tomorrow 6:30 PM",
                slots_total=10,
                slots_filled=4,
                skill_level="Intermediate / Competitive",
                notes="Need 6 more players for full 5v5 match. Bibs & match ball provided. Friendly competitive spirit."
            )
            db.add(match1)
            db.flush()
            db.add(MatchParticipant(match_id=match1.id, player_id=player_prof1.id))

            # Demo Certificate
            cert1 = Certificate(
                user_id=player_user1.id,
                title="State Championship Golden Boot",
                issuing_body="National Youth Sports Federation",
                issue_date="2025-11",
                cert_type="TOURNAMENT_WIN",
                is_verified=True
            )
            db.add(cert1)

            db.commit()
            print("[Startup] Seeded demo users, tactics, and matchmaking requests.")
    finally:
        db.close()

seed_demo_data()

@app.on_event("startup")
def on_startup():
    seed_demo_data()

@app.get("/")
def root():
    return {
        "app": "TacticHub API v2",
        "status": "online",
        "features": [
            "Tactics Strategy Hub",
            "Player & Coach Certificates Portal",
            "Matchmaking / LFG Player Finder",
            "Coach Scouting & Direct Invites",
            "Computer Vision AI Coach Verification"
        ]
    }
