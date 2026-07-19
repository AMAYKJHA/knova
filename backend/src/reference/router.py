from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.deps import get_db
from src.reference import service as ref_service
from .schemas import TopicCreateRequest


router = APIRouter()

@router.get("/topics")
async def get_topics(limit: int | None = None, db: AsyncSession = Depends(get_db)):
    return await ref_service.list_topics(db, limit)

@router.post("/topics")
async def add_topic(body: TopicCreateRequest, db: AsyncSession = Depends(get_db)):
    return await ref_service.create_topic(body.name, body.parent_id, db)