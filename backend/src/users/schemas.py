from pydantic import BaseModel, ConfigDict, EmailStr
from uuid import UUID

class UserProfileResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    avatar_url: str | None = None
    bio: str | None = None
    onboarding_completed: bool = False
    
    # Creator details (defaults if not creator)
    headline: str | None = None
    credentials: str | None = None
    primary_topics: list[str] = []
    
    # Stats
    followers: int = 0
    following: int = 0
    posts: int = 0
    authority_score: float = 0.0
    
    # Counters
    total_upvotes: int = 0
    total_comments: int = 0
    total_shares: int = 0

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    username: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    headline: str | None = None
    credentials: str | None = None
    primary_topics: list[str] | None = None


class InterestItem(BaseModel):
    topic_id: UUID
    name: str
    affinity_score: float = 0.0
    source: str | None = None

    model_config = ConfigDict(from_attributes=True)


class InterestListResponse(BaseModel):
    interests: list[InterestItem]


class InterestUpdateRequest(BaseModel):
    # Full set of desired interest topic names (by DB topic name). Replaces the
    # user's explicit interests; implicit/learned interests are left untouched.
    interests: list[str]
