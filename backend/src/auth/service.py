from fastapi import HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import select

from src.db.models import User
from src.auth.schemas import RegisterRequest, LoginRequest
from core.security import (
    hash_password, verify_password, decode_token,
    issue_tokens, set_auth_cookies,
)


def refresh_user_session(response: Response, db: Session, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.get(User, payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    _tokens = issue_tokens(str(user.id))
    access_token = _tokens["access_token"]
    new_refresh_token = _tokens["refresh_token"]

    set_auth_cookies(response, access_token, new_refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
        },
    }


def register_user(response: Response, db: Session, body: RegisterRequest) -> dict:
    existing = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        username=body.username,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _tokens = issue_tokens(str(user.id))
    access_token = _tokens.get("access_token")
    refresh_token = _tokens.get("refresh_token")

    set_auth_cookies(response, access_token, refresh_token)
    response.status_code = 201

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
        },
    }


def login_user(response: Response, db: Session, body: LoginRequest) -> dict:
    user = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(body.password_hash, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _tokens = issue_tokens(str(user.id))
    access_token = _tokens.get("access_token")
    refresh_token = _tokens.get("refresh_token")

    set_auth_cookies(response, access_token, refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
        },
    }

