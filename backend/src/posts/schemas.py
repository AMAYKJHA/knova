from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserBrief(BaseModel):
    id: UUID
    username: str
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CreatorBrief(BaseModel):
    id: UUID
    user_id: UUID
    headline: str | None = None
    authority_score: float = 0.0
    follower_count: int = 0
    user: UserBrief

    model_config = ConfigDict(from_attributes=True)


class McqData(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str | None = None

    model_config = ConfigDict(from_attributes=True)


class FlashcardData(BaseModel):
    front: str
    back: str
    flip_threshold_sec: float | None = None

    model_config = ConfigDict(from_attributes=True)


class PostResponse(BaseModel):
    id: UUID
    creator_id: UUID
    topic_id: UUID | None = None
    content_type: str
    title: str | None = None
    body: str
    difficulty: float
    status: str
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    upvote_count: int
    downvote_count: int
    comment_count: int
    save_count: int
    share_count: int
    total_votes: int

    creator: CreatorBrief | None = None
    tags: list[str] = []
    mcq: McqData | None = None
    flashcard: FlashcardData | None = None

    # per-request personalization (populated only for authenticated users)
    user_vote: int | None = None
    user_saved: bool = False

    model_config = ConfigDict(from_attributes=True)


class PostListResponse(BaseModel):
    items: list[PostResponse]
    total: int
    page: int
    size: int
    has_next: bool


class VoteRequest(BaseModel):
    # +1 upvote, -1 downvote. Sending the value that's already set clears the vote.
    value: int


class SaveResponse(BaseModel):
    post_id: UUID
    saved: bool
    save_count: int
