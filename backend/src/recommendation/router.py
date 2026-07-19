import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ml import constants as C
from src.db.models import User
from src.deps import get_db, is_authenticated
from src.posts.schemas import PostListResponse
from . import service

router = APIRouter(tags=["feed"])


@router.get("/feed", response_model=PostListResponse)
async def get_feed(
    size: int = Query(C.N_RANKED, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    token_payload: dict = Depends(is_authenticated),
):
    """Personalized recommendation feed: interest + tag-adjacent + followed-creator
    retrieval, ALS collaborative filtering, LightGBM ranking, and Thompson-sampled
    exploration. Each call re-runs retrieval excluding already-seen posts, so paging
    is just repeated requests."""
    user = await db.get(User, uuid.UUID(token_payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await service.get_feed(db, user, size)
