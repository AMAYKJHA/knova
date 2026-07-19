from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.db.models import ContentType, Post, SavedPost, Vote
from .schemas import (
    CreatorBrief,
    FlashcardData,
    McqData,
    PostListResponse,
    PostResponse,
    SaveResponse,
    UserBrief,
)

def _load_options():
    """Relationships every serialized post needs, eager-loaded to avoid N+1 queries."""
    from src.db.models import CreatorProfile

    return (
        selectinload(Post.creator).selectinload(CreatorProfile.user),
        selectinload(Post.tags),
        selectinload(Post.mcq),
        selectinload(Post.flashcard),
    )


def _serialize_post(
    post: Post,
    user_vote: int | None = None,
    user_saved: bool = False,
) -> PostResponse:
    creator = None
    if post.creator is not None and post.creator.user is not None:
        creator = CreatorBrief(
            id=post.creator.id,
            user_id=post.creator.user_id,
            headline=post.creator.headline,
            authority_score=post.creator.authority_score,
            follower_count=post.creator.follower_count,
            user=UserBrief(
                id=post.creator.user.id,
                username=post.creator.user.username,
                avatar_url=post.creator.user.avatar_url,
            ),
        )

    mcq = None
    if post.mcq is not None:
        mcq = McqData(
            question=post.mcq.question,
            options=post.mcq.options,
            correct_index=post.mcq.correct_index,
            explanation=post.mcq.explanation,
        )

    flashcard = None
    if post.flashcard is not None:
        flashcard = FlashcardData(
            front=post.flashcard.front,
            back=post.flashcard.back,
            flip_threshold_sec=post.flashcard.flip_threshold_sec,
        )

    return PostResponse(
        id=post.id,
        creator_id=post.creator_id,
        topic_id=post.topic_id,
        content_type=post.content_type.value,
        title=post.title,
        body=post.body,
        difficulty=post.difficulty,
        status=post.status,
        published_at=post.published_at,
        created_at=post.created_at,
        updated_at=post.updated_at,
        upvote_count=post.upvote_count,
        downvote_count=post.downvote_count,
        comment_count=post.comment_count,
        save_count=post.save_count,
        share_count=post.share_count,
        total_votes=post.upvote_count - post.downvote_count,
        creator=creator,
        tags=[t.name for t in post.tags],
        mcq=mcq,
        flashcard=flashcard,
        user_vote=user_vote,
        user_saved=user_saved,
    )


async def _user_states(
    db: AsyncSession, user_id: UUID | None, post_ids: list[UUID]
) -> tuple[dict[UUID, int], set[UUID]]:
    """Fetch this user's vote value and saved state for the given posts in two
    batched queries (returns empties for anonymous requests)."""
    if not user_id or not post_ids:
        return {}, set()

    vote_rows = (
        await db.execute(
            select(Vote.post_id, Vote.value).where(
                Vote.user_id == user_id, Vote.post_id.in_(post_ids)
            )
        )
    ).all()
    votes_map = {pid: value for pid, value in vote_rows}

    saved_rows = (
        await db.execute(
            select(SavedPost.post_id).where(
                SavedPost.user_id == user_id, SavedPost.post_id.in_(post_ids)
            )
        )
    ).scalars().all()

    return votes_map, set(saved_rows)


def _order_clause(sort_by: str):
    if sort_by == "top":
        return (Post.upvote_count.desc(), Post.created_at.desc())
    if sort_by == "discussed":
        return (Post.comment_count.desc(), Post.created_at.desc())
    # default: newest first
    return (Post.published_at.desc().nullslast(), Post.created_at.desc())


async def list_posts(
    db: AsyncSession,
    *,
    page: int,
    size: int,
    sort_by: str,
    creator_id: UUID | None,
    topic_id: UUID | None,
    content_type: str | None,
    search: str | None,
    user_id: UUID | None,
) -> PostListResponse:
    filters = [Post.status == "published"]

    if creator_id is not None:
        filters.append(Post.creator_id == creator_id)
    if topic_id is not None:
        filters.append(Post.topic_id == topic_id)
    if content_type is not None:
        try:
            ct = ContentType(content_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid content_type '{content_type}'",
            )
        filters.append(Post.content_type == ct)
    if search:
        like = f"%{search}%"
        filters.append(or_(Post.title.ilike(like), Post.body.ilike(like)))

    total = (
        await db.execute(select(func.count(Post.id)).where(*filters))
    ).scalar() or 0

    result = await db.execute(
        select(Post)
        .where(*filters)
        .options(*_load_options())
        .order_by(*_order_clause(sort_by))
        .offset((page - 1) * size)
        .limit(size)
    )
    posts = result.scalars().all()

    votes_map, saved_set = await _user_states(db, user_id, [p.id for p in posts])
    items = [
        _serialize_post(p, votes_map.get(p.id), p.id in saved_set) for p in posts
    ]

    return PostListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        has_next=page * size < total,
    )


async def get_post(
    db: AsyncSession, post_id: UUID, user_id: UUID | None
) -> PostResponse:
    result = await db.execute(
        select(Post).where(Post.id == post_id).options(*_load_options())
    )
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    votes_map, saved_set = await _user_states(db, user_id, [post.id])
    return _serialize_post(post, votes_map.get(post.id), post.id in saved_set)


async def cast_vote(
    db: AsyncSession, user_id: UUID, post_id: UUID, value: int
) -> PostResponse:
    """Upsert this user's vote and keep the post's denormalized counters in sync.
    Re-sending the current value clears the vote (toggle off)."""
    if value not in (1, -1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="value must be 1 (upvote) or -1 (downvote)",
        )

    post = (
        await db.execute(
            select(Post).where(Post.id == post_id).options(*_load_options())
        )
    ).scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = (
        await db.execute(
            select(Vote).where(Vote.user_id == user_id, Vote.post_id == post_id)
        )
    ).scalar_one_or_none()

    if existing is None:
        db.add(Vote(user_id=user_id, post_id=post_id, value=value))
        if value == 1:
            post.upvote_count += 1
        else:
            post.downvote_count += 1
    elif existing.value == value:
        # same button pressed again -> remove the vote
        await db.delete(existing)
        if value == 1:
            post.upvote_count = max(0, post.upvote_count - 1)
        else:
            post.downvote_count = max(0, post.downvote_count - 1)
    else:
        # switched sides -> move the count from the old side to the new one
        existing.value = value
        if value == 1:
            post.upvote_count += 1
            post.downvote_count = max(0, post.downvote_count - 1)
        else:
            post.downvote_count += 1
            post.upvote_count = max(0, post.upvote_count - 1)

    await db.commit()

    # Mutating the row makes the DB regenerate `updated_at` (onupdate=func.now()),
    # which the commit expires; re-fetch with relationships so serialization never
    # triggers a lazy (sync) load in this async context.
    post = (
        await db.execute(
            select(Post).where(Post.id == post_id).options(*_load_options())
        )
    ).scalar_one()

    votes_map, saved_set = await _user_states(db, user_id, [post.id])
    return _serialize_post(post, votes_map.get(post.id), post.id in saved_set)


async def toggle_save(db: AsyncSession, user_id: UUID, post_id: UUID) -> SaveResponse:
    """Toggle whether this user has the post saved, keeping save_count in sync."""
    post = (
        await db.execute(select(Post).where(Post.id == post_id))
    ).scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = (
        await db.execute(
            select(SavedPost).where(
                SavedPost.user_id == user_id, SavedPost.post_id == post_id
            )
        )
    ).scalar_one_or_none()

    if existing is None:
        db.add(SavedPost(user_id=user_id, post_id=post_id))
        post.save_count += 1
        saved = True
    else:
        await db.delete(existing)
        post.save_count = max(0, post.save_count - 1)
        saved = False

    # Read the counter before commit — commit can expire attributes, and a
    # post-commit read would lazy-load (sync IO) in this async context.
    new_count = post.save_count
    await db.commit()
    return SaveResponse(post_id=post_id, saved=saved, save_count=new_count)
