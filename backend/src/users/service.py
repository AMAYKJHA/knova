from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import User, CreatorProfile, CreatorFollow, Post, Topic, UserTopicInterest
from .schemas import InterestItem, InterestListResponse, ProfileUpdateRequest

# Interests the user set by hand (onboarding + settings). set_user_interests only
# adds/removes within these sources, so implicit signals (inferred, thompson_discovery)
# learned from engagement survive an edit.
EXPLICIT_INTEREST_SOURCES = {"onboarding", "manual"}
MANUAL_AFFINITY = 1.0

async def get_user_profile(db: AsyncSession, username: str) -> dict:
    result = await db.execute(select(User).where(func.lower(User.username) == username.lower()))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    # Get following count
    following_result = await db.execute(
        select(func.count(CreatorFollow.id)).where(CreatorFollow.follower_id == user.id)
    )
    following_count = following_result.scalar() or 0
    
    # Get creator profile
    creator_result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == user.id)
    )
    creator_profile = creator_result.scalar_one_or_none()
    
    # Defaults
    headline = None
    credentials = None
    primary_topics = []
    followers_count = 0
    posts_count = 0
    authority_score = 0.0
    total_upvotes = 0
    total_comments = 0
    total_shares = 0
    
    if creator_profile:
        headline = creator_profile.headline
        credentials = creator_profile.credentials
        primary_topics = creator_profile.primary_topics or []
        authority_score = creator_profile.authority_score or 0.0
        
        # Followers count
        followers_result = await db.execute(
            select(func.count(CreatorFollow.id)).where(CreatorFollow.creator_id == creator_profile.id)
        )
        followers_count = followers_result.scalar() or 0
        
        # Posts count
        posts_result = await db.execute(
            select(func.count(Post.id)).where(Post.creator_id == creator_profile.id)
        )
        posts_count = posts_result.scalar() or 0
        
        # Totals
        totals_result = await db.execute(
            select(
                func.sum(Post.upvote_count),
                func.sum(Post.comment_count),
                func.sum(Post.share_count)
            ).where(Post.creator_id == creator_profile.id)
        )
        totals = totals_result.fetchone()
        if totals:
            total_upvotes = totals[0] or 0
            total_comments = totals[1] or 0
            total_shares = totals[2] or 0

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "onboarding_completed": user.onboarding_completed,
        "headline": headline,
        "credentials": credentials,
        "primary_topics": primary_topics,
        "followers": followers_count,
        "following": following_count,
        "posts": posts_count,
        "authority_score": authority_score,
        "total_upvotes": total_upvotes,
        "total_comments": total_comments,
        "total_shares": total_shares
    }

async def update_user_profile(db: AsyncSession, user_id: UUID, data: ProfileUpdateRequest) -> dict:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if data.username is not None:
        new_username = data.username.strip()
        if not new_username:
            raise HTTPException(status_code=400, detail="Username cannot be empty")
        taken_result = await db.execute(
            select(User).where(func.lower(User.username) == new_username.lower(), User.id != user_id)
        )
        if taken_result.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Username already taken")
        user.username = new_username
        
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
        
    if data.bio is not None:
        user.bio = data.bio
        
    # Update creator profile
    creator_result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == user_id)
    )
    creator_profile = creator_result.scalar_one_or_none()
    
    creator_fields_supplied = (
        data.headline is not None or 
        data.credentials is not None or 
        data.primary_topics is not None
    )
    
    if creator_fields_supplied or creator_profile:
        if not creator_profile:
            creator_profile = CreatorProfile(user_id=user_id)
            db.add(creator_profile)
            
        if data.headline is not None:
            creator_profile.headline = data.headline
        if data.credentials is not None:
            creator_profile.credentials = data.credentials
        if data.primary_topics is not None:
            creator_profile.primary_topics = data.primary_topics
            
    await db.commit()
    await db.refresh(user)

    return await get_user_profile(db, user.username)


async def get_user_interests(db: AsyncSession, user_id: UUID) -> InterestListResponse:
    rows = (
        await db.execute(
            select(
                UserTopicInterest.topic_id,
                Topic.name,
                UserTopicInterest.affinity_score,
                UserTopicInterest.source,
            )
            .join(Topic, Topic.id == UserTopicInterest.topic_id)
            .where(UserTopicInterest.user_id == user_id)
            .order_by(Topic.name)
        )
    ).all()

    return InterestListResponse(
        interests=[
            InterestItem(topic_id=tid, name=name, affinity_score=float(aff or 0.0), source=src)
            for tid, name, aff, src in rows
        ]
    )


async def set_user_interests(
    db: AsyncSession, user_id: UUID, interests: list[str]
) -> InterestListResponse:
    """Replace the user's *explicit* interests with the given topic names. Adds new
    picks, removes explicit ones no longer selected, and promotes a previously
    implicit interest to explicit if the user re-selects it. Learned implicit
    interests that aren't re-selected are left in place."""
    names = list(dict.fromkeys(i.strip() for i in interests if i and i.strip()))

    resolved = (
        await db.execute(
            select(Topic).where(func.lower(Topic.name).in_([n.lower() for n in names]))
        )
    ).scalars().all() if names else []
    topic_by_lower = {t.name.lower(): t for t in resolved}

    unresolved = [n for n in names if n.lower() not in topic_by_lower]
    if unresolved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown topics: {', '.join(unresolved)}",
        )

    desired_ids = {t.id for t in topic_by_lower.values()}

    existing = {
        row.topic_id: row
        for row in (
            await db.execute(
                select(UserTopicInterest).where(UserTopicInterest.user_id == user_id)
            )
        ).scalars().all()
    }

    # add new / promote implicit -> explicit
    for tid in desired_ids:
        row = existing.get(tid)
        if row is None:
            db.add(
                UserTopicInterest(
                    user_id=user_id,
                    topic_id=tid,
                    affinity_score=MANUAL_AFFINITY,
                    source="manual",
                )
            )
        elif row.source not in EXPLICIT_INTEREST_SOURCES:
            row.source = "manual"
            row.affinity_score = MANUAL_AFFINITY

    # remove explicit interests the user deselected (keep implicit ones)
    for tid, row in existing.items():
        if tid not in desired_ids and row.source in EXPLICIT_INTEREST_SOURCES:
            await db.delete(row)

    await db.commit()
    return await get_user_interests(db, user_id)
