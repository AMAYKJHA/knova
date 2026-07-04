from datetime import datetime, timedelta, UTC

from fastapi import Depends, HTTPException, Response
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import get_settings

settings = get_settings()

SECRET_kEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(raw_password: str) -> str:
    return pwd_context.hash(raw_password)

def verify_password(raw_password: str, hash: str) -> bool:
    return pwd_context.verify(raw_password, hash)


def generate_access_token(sub: str) -> str:
    expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": sub, "exp": expire, "type": "access"}
    return jwt.encode(payload, SECRET_kEY, algorithm=ALGORITHM)


def generate_refresh_token(sub: str) -> str:
    expire = datetime.now() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": sub, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, SECRET_kEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_kEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    

def issue_tokens(sub: str) -> dict[str, str]:
    access_token = generate_access_token(sub)
    refresh_token = generate_refresh_token(sub)
    return {"access_token": access_token, "refresh_token": refresh_token}

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path="/auth/refresh",
    )