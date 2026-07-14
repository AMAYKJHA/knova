from pydantic import BaseModel, EmailStr
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
