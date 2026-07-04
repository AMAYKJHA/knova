from fastapi import APIRouter, Cookie, Depends, Response, HTTPException

from sqlalchemy.orm import Session
from src.deps import get_db
from .schemas import RegisterRequest, LoginRequest
from .service import register_user, login_user, refresh_user_session


router = APIRouter(tags=["auth"])


@router.post("/register")
def register(response: Response, body: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(response, db, body)


@router.post("/login")
def login(response: Response, body: LoginRequest, db: Session = Depends(get_db)):
    return login_user(response, db, body)


@router.post("/refresh")
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str = Cookie(default=None),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    return refresh_user_session(response, db, refresh_token)
