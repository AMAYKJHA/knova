import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.deps import get_db, is_authenticated
from src.db.models import User

from .schemas import (
    OnboardingRequest,
    OnboardingResponse,
)

from .service import save_user_interests

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.post(
    "/interests",
    response_model=OnboardingResponse,
)
async def save_interests(
    request: OnboardingRequest,
    db: AsyncSession = Depends(get_db),
    token_payload: dict = Depends(is_authenticated),
):
    user_id = uuid.UUID(token_payload["sub"])
    user = await db.get(User, user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await save_user_interests(
        db,
        user,
        request.interests,
    )

    return OnboardingResponse(
        message="Interests saved successfully."
    )