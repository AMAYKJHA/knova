from datetime import datetime, UTC

from fastapi import HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.db.models import User
from src.auth.schemas import RegisterRequest, LoginRequest
from core.security import (
    hash_password, verify_password, decode_token,
    issue_tokens, set_auth_cookies,
)


async def refresh_user_session(response: Response, db: AsyncSession, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = await db.get(User, payload["sub"])
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
            "avatar_url": user.avatar_url,
            "onboarding_completed": user.onboarding_completed,
        },
    }


async def register_user(response: Response, db: AsyncSession, body: RegisterRequest) -> dict:
    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        username=body.username.strip().title(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

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
            "avatar_url": user.avatar_url,
            "onboarding_completed": user.onboarding_completed,
        },
    }


async def login_user(response: Response, db: AsyncSession, body: LoginRequest) -> dict:
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_active_at = datetime.now()
    await db.commit()
    
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
            "avatar_url": user.avatar_url,
            "onboarding_completed": user.onboarding_completed,
        },
    }
