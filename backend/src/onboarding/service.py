from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import CreatorProfile, User


async def save_user_interests(
    db: AsyncSession,
    user: User,
    interests: list[str],
) -> None:
    if not interests:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Select at least one interest")

    user.onboarding_completed = True
    user.last_active_at = datetime.now()

    creator_result = await db.execute(select(CreatorProfile).where(CreatorProfile.user_id == user.id))
    creator_profile = creator_result.scalar_one_or_none()

    if creator_profile is None:
        creator_profile = CreatorProfile(user_id=user.id)
        db.add(creator_profile)

    user.creator_profile = creator_profile
    creator_profile.primary_topics = interests

    await db.commit()
    await db.refresh(user)