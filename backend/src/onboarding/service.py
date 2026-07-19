from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import Topic, User, UserTopicInterest

# Mirrors the seeded onboarding interests (knova_interests.csv): every explicit
# onboarding pick lands as a source="onboarding" row with a full-strength weight,
# so organic users are indistinguishable from seeded ones to the recommender.
ONBOARDING_AFFINITY = 1.0
ONBOARDING_SOURCE = "onboarding"


async def save_user_interests(
    db: AsyncSession,
    user: User,
    interests: list[str],
) -> None:
    """Persist the topics a user selected during onboarding as UserTopicInterest
    rows (the table the recommender's interest tier + topic_similarity read from).

    Incoming values are topic *names* from the picker; they're resolved to Topic
    rows (case-insensitive) so we store the FK the ranker joins on. Names that
    don't resolve mean the frontend picker has drifted from the DB vocabulary,
    which would silently break personalization -> we fail loudly instead."""
    # de-dupe + trim while preserving selection order
    names = list(dict.fromkeys(i.strip() for i in interests if i and i.strip()))
    if not names:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select at least one interest",
        )

    topic_rows = (
        await db.execute(
            select(Topic).where(func.lower(Topic.name).in_([n.lower() for n in names]))
        )
    ).scalars().all()
    topic_by_lower = {t.name.lower(): t for t in topic_rows}

    unresolved = [n for n in names if n.lower() not in topic_by_lower]
    if unresolved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown topics: {', '.join(unresolved)}",
        )

    # Idempotent: re-running onboarding shouldn't duplicate rows.
    existing_topic_ids = set(
        (
            await db.execute(
                select(UserTopicInterest.topic_id).where(
                    UserTopicInterest.user_id == user.id
                )
            )
        ).scalars().all()
    )

    for name in names:
        topic = topic_by_lower[name.lower()]
        if topic.id in existing_topic_ids:
            continue
        db.add(
            UserTopicInterest(
                user_id=user.id,
                topic_id=topic.id,
                affinity_score=ONBOARDING_AFFINITY,
                source=ONBOARDING_SOURCE,
            )
        )

    user.onboarding_completed = True
    user.last_active_at = datetime.now()

    await db.commit()
    await db.refresh(user)
