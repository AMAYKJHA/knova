from uuid import UUID, uuid4

from fastapi import HTTPException, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import Topic
from .schemas import TopicResponse

async def list_topics(db: AsyncSession, limit: int | None = None):
    # limit=None returns the full vocabulary (used by the onboarding picker so its
    # options always match the DB/model topic set); a limit caps it when provided.
    stmt = select(Topic).order_by(Topic.name)
    if limit is not None:
        stmt = stmt.limit(limit)

    topics = (await db.execute(stmt)).scalars().all()

    return {
        "topics": [TopicResponse.model_validate(t) for t in topics],
        "total": len(topics),
    }
    
async def create_topic(name: str, parent_id: UUID | None, db: AsyncSession):
    name = name.strip().title()
    
    if parent_id:
        parent_topic = (await db.execute(
            select(Topic)
            .where(Topic.parent_id == parent_id)
        )).scalar_one_or_none()
        
        if not parent_topic:
            raise HTTPException(status_code=404, detail="Invalid parent_id")
        
    topic_exists = (await db.execute(
        select(Topic)
        .where(Topic.name == name)
    )).scalar_one_or_none()
    
    if topic_exists is not None:
        raise HTTPException(status_code=400, detail=f"Topic with name <{name}> already exists")
    
    topic = Topic(
        name=name,
        parent_id=parent_id
    )
    db.add(topic)
    await db.commit()
    await db.refresh(topic)
    
    return TopicResponse.model_validate(topic)
    