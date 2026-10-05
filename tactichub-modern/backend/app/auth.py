from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from .database import get_db
from .models import User, PlayerProfile, CoachProfile
from .schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_player(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PlayerProfile:
    if current_user.role != "PLAYER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access reserved for players only")
    player = db.query(PlayerProfile).filter(PlayerProfile.user_id == current_user.id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player profile not found")
    return player

def get_current_coach(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> CoachProfile:
    if current_user.role != "COACH":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access reserved for coaches only")
    coach = db.query(CoachProfile).filter(CoachProfile.user_id == current_user.id).first()
    if not coach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coach profile not found")
    return coach
