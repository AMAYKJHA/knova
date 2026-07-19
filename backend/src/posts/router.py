import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.deps import get_db, get_optional_user, is_authenticated
from . import service
from .schemas import PostListResponse, PostResponse, SaveResponse, VoteRequest

router = APIRouter(tags=["posts"])


@router.get("", response_model=PostListResponse)
async def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("new", description="new | top | discussed"),
    creator_id: uuid.UUID | None = None,
    topic_id: uuid.UUID | None = None,
    content_type: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: dict | None = Depends(get_optional_user),
):
    user_id = uuid.UUID(user["sub"]) if user else None
    return await service.list_posts(
        db,
        page=page,
        size=size,
        sort_by=sort_by,
        creator_id=creator_id,
        topic_id=topic_id,
        content_type=content_type,
        search=search,
        user_id=user_id,
    )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: dict | None = Depends(get_optional_user),
):
    user_id = uuid.UUID(user["sub"]) if user else None
    return await service.get_post(db, post_id, user_id)


@router.post("/{post_id}/vote", response_model=PostResponse)
async def vote(
    post_id: uuid.UUID,
    body: VoteRequest,
    db: AsyncSession = Depends(get_db),
    token_payload: dict = Depends(is_authenticated),
):
    user_id = uuid.UUID(token_payload["sub"])
    return await service.cast_vote(db, user_id, post_id, body.value)


@router.post("/{post_id}/save", response_model=SaveResponse)
async def save(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    token_payload: dict = Depends(is_authenticated),
):
    user_id = uuid.UUID(token_payload["sub"])
    return await service.toggle_save(db, user_id, post_id)
