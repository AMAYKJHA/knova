"""Feed orchestration: retrieve -> build features -> rank -> serialize.

Runs the whole recommendation pipeline in ext_id space, then maps the ranked post
ids back to full Post rows and reuses the posts serializer so the feed response is
identical in shape to the rest of the posts API.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ml.loader import models
from src.db.models import Post, User
from src.posts.schemas import PostListResponse
from src.posts.service import _load_options, _serialize_post, _user_states

from .features import build_feature_frame
from .ranker import assemble_feed
from .retrieval import load_user_context, retrieve_candidates


async def get_feed(db: AsyncSession, user: User, size: int) -> PostListResponse:
    # Warm-load artifacts on first use (idempotent).
    if not models.is_loaded:
        models.load()

    empty = PostListResponse(items=[], total=0, page=1, size=size, has_next=False)

    ctx = await load_user_context(db, user)
    candidates = await retrieve_candidates(db, ctx)
    if not candidates:
        return empty

    frame = build_feature_frame(ctx, candidates)
    ranked = assemble_feed(frame, n_ranked=size)
    ordered_ids: list[UUID] = [r["post_id"] for r in ranked]
    if not ordered_ids:
        return empty

    posts = (
        await db.execute(
            select(Post).where(Post.id.in_(ordered_ids)).options(*_load_options())
        )
    ).scalars().all()
    by_id = {p.id: p for p in posts}

    votes_map, saved_set = await _user_states(db, user.id, ordered_ids)
    items = [
        _serialize_post(by_id[pid], votes_map.get(pid), pid in saved_set)
        for pid in ordered_ids
        if pid in by_id
    ]

    return PostListResponse(
        items=items,
        total=len(items),
        page=1,
        size=size,
        has_next=False,
    )
