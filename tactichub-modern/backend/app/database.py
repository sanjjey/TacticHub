from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def migrate_sqlite_schema():
    if "sqlite" in DATABASE_URL:
        import sqlite3
        db_path = DATABASE_URL.replace("sqlite:///", "")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(tactics)")
            cols = [r[1] for r in cursor.fetchall()]
            # If tactics table exists but still has legacy coach_id constraint
            if "coach_id" in cols:
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS tactics_new (
                    id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL,
                    game VARCHAR(100) NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    description TEXT NOT NULL,
                    media_url VARCHAR(255),
                    media_type VARCHAR(20),
                    created_at DATETIME,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
                """)
                cursor.execute("""
                INSERT OR IGNORE INTO tactics_new (id, user_id, game, title, description, media_url, media_type, created_at)
                SELECT id, COALESCE(user_id, coach_id), game, title, description, media_url, media_type, created_at
                FROM tactics
                """)
                cursor.execute("DROP TABLE tactics")
                cursor.execute("ALTER TABLE tactics_new RENAME TO tactics")
                conn.commit()
            conn.close()
        except Exception:
            pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
