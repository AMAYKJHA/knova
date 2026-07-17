"""
    Database Schema
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from pgvector.sqlalchemy import Vector


def uuid_pk():
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

# Enums
# -----------------------------------------------------
class OAuthProvider(str, enum.Enum):
    GOOGLE = "google"
    FACEBOOK = "facebook"


class ContentType(str, enum.Enum):
    """Kind of educational unit a Post carries. Encoded as a ranker feature
    (mirrors knova_type_encoder.pkl); payload rows live in the mcqs/flashcards tables.
    The ML data's `text_content` label collapses to TEXT at seed time; `short_note`
    is kept distinct to preserve content_type_enc parity with training."""
    TEXT = "text"
    MCQ = "mcq"
    FLASHCARD = "flashcard"
    SHORT_NOTE = "short_note"


class InteractionSurface(str, enum.Enum):
    """Where a post was shown when the interaction happened -> lets the ranker
    de-bias position/surface effects from raw engagement telemetry."""
    FEED = "feed"          # main recommended feed (tiktok-style)
    PROFILE = "profile"
    SEARCH = "search"
    TOPIC = "topic"
    SAVED = "saved"


# Tables
# ------------------------------------------------------
class Base(DeclarativeBase):
    pass



# Auth
# -------------------------------------------------------

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = uuid_pk()
    # Integer bridge to the ML artifacts (ALS/TF-IDF/feature CSV keys). Seeded users
    # carry the generator's integer user_id here; organic users leave it NULL.
    ext_id: Mapped[int | None] = mapped_column(Integer, nullable=True, unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None]= mapped_column(String(255), nullable=True)
    username: Mapped[str] = mapped_column(String(50), index=True, nullable=False, default="Username")
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime)
    
    interest_embedding: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)
    estimated_expertise: Mapped[float] = mapped_column(Float, default=0.5)   # base_skill_level (0..1)
    curiosity_score: Mapped[float] = mapped_column(Float, default=0.5)       # exploration appetite (0..1)

    oauth_accounts: Mapped[list["OAuth"]] = relationship(back_populates="user")
    creator_profile: Mapped["CreatorProfile | None"] = relationship(back_populates="user")
    interest_topics: Mapped[list["UserTopicInterest"]] = relationship(back_populates="user")


class OAuth(Base):
    __tablename__ = "oauth"
    
    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider: Mapped[OAuthProvider] = mapped_column(Enum(OAuthProvider), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    access_token: Mapped[str | None] = mapped_column(Text)
    refresh_token: Mapped[str | None] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    user: Mapped["User"] = relationship(back_populates="oauth_accounts")
    
    
    
# Creator
# -----------------------------------------------------------
 
class CreatorProfile(Base):
    __tablename__ = "creatorprofiles"
 
    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    # Integer bridge to the ML artifacts (creator_id in the content/follows/
    # interactions CSVs). Lets the seeder resolve follows/interactions directly
    # instead of hopping through User.ext_id. Organic creators leave it NULL.
    ext_id: Mapped[int | None] = mapped_column(Integer, nullable=True, unique=True, index=True)

    headline: Mapped[str | None] = mapped_column(String(150))
    credentials: Mapped[str | None] = mapped_column(Text)  # e.g. "MSc Physics, 5yr teaching"
    primary_topics: Mapped[list[str] | None] = mapped_column(JSONB)  # ["physics", "calculus"]
 
    # ranker features
    authority_score: Mapped[float] = mapped_column(Float, default=0.0)   # reputation, updated by batch job
    follower_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_post_upvote_rate: Mapped[float] = mapped_column(Float, default=0.0)
    is_verified_educator: Mapped[bool] = mapped_column(Boolean, default=False)
 
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
 
    user: Mapped["User"] = relationship(back_populates="creator_profile")
    posts: Mapped[list["Post"]] = relationship(back_populates="creator", cascade="all, delete-orphan") 
 
 
class CreatorFollow(Base):
    """Follower graph -> used both for creator-based retrieval and social proof."""
    __tablename__ = "creator_follows"
    __table_args__ = (UniqueConstraint("follower_id", "creator_id", name="uq_follow_pair"),)
 
    id: Mapped[uuid.UUID] = uuid_pk()
    follower_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("creatorprofiles.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    

# Topics
# ---------------------------------------------------------

class Topic(Base):
    __tablename__ = "topics"
    
    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("topics.id"), nullable=True)  # hierarchical taxonomy
 
 
class UserTopicInterest(Base):
    """Explicit + implicit per-topic affinity score, refreshed by a batch job.
    Cheap input feature for CF / content ranker; avoids recomputing from raw logs every request."""
    __tablename__ = "user_topic_interests"
    __table_args__ = (UniqueConstraint("user_id", "topic_id", name="uq_user_topic"),)
 
    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    topic_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    affinity_score: Mapped[float] = mapped_column(Float, default=0.0)
    # origin of the affinity: "onboarding" (explicit) vs implicit signals
    # (mirrors the `source` column in knova_interests.csv)
    source: Mapped[str | None] = mapped_column(String(30), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
 
    user: Mapped["User"] = relationship(back_populates="interest_topics")
    
    
# Posts
# ------------------------------------------------------------
 
class Post(Base):
    __tablename__ = "posts"
 
    id: Mapped[uuid.UUID] = uuid_pk()
    # Integer bridge to the ML artifacts (content_id in ALS/TF-IDF/feature CSVs).
    # Seeded posts carry the generator's content_id; organic posts leave it NULL.
    # Not unique: organic posts are all NULL.
    ext_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("creatorprofiles.id", ondelete="CASCADE"), index=True)

    content_type: Mapped[ContentType] = mapped_column(
        Enum(ContentType), default=ContentType.TEXT, index=True
    )  # text | mcq | flashcard

    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    est_read_seconds: Mapped[int] = mapped_column(Integer, default=0)
 
    difficulty: Mapped[float] = mapped_column(Float, default=0.5)  # 0=beginner..1=advanced (set by creator or model)
    topic_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("topics.id"), nullable=True, index=True)
 
    # semantic embedding for content-based retrieval
    embedding: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)
 
    status: Mapped[str] = mapped_column(String(20), default="published")  # draft|published|removed
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
 
    # --- denormalized counters for fast feed rendering / ranker features ---
    impression_count: Mapped[int] = mapped_column(Integer, default=0)
    read_complete_count: Mapped[int] = mapped_column(Integer, default=0)
    upvote_count: Mapped[int] = mapped_column(Integer, default=0)
    downvote_count: Mapped[int] = mapped_column(Integer, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, default=0)
    save_count: Mapped[int] = mapped_column(Integer, default=0)
    share_count: Mapped[int] = mapped_column(Integer, default=0)
 
    creator: Mapped["CreatorProfile"] = relationship(back_populates="posts")
    votes: Mapped[list["Vote"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    interactions: Mapped[list["Interaction"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    tags: Mapped[list["Tag"]] = relationship(secondary="post_tags", back_populates="posts")

    # content-type specific payloads (exactly one is populated per post)
    mcq: Mapped["Mcq | None"] = relationship(back_populates="post", uselist=False, cascade="all, delete-orphan")
    flashcard: Mapped["Flashcard | None"] = relationship(back_populates="post", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_posts_topic_published", "topic_id", "published_at"),
    )


# Content-type payloads
# ------------------------------------------------------------
# A Post row holds the shared feed fields (title, body, counters, embedding);
# these tables hold the structured payload for non-text content types.

class Mcq(Base):
    """Structured multiple-choice payload for a Post with content_type=MCQ.
    Pairs with knova_mcq_model.pkl."""
    __tablename__ = "mcqs"

    id: Mapped[uuid.UUID] = uuid_pk()
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), unique=True, index=True)

    question: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list[str]] = mapped_column(JSONB, nullable=False)   # ["opt a", "opt b", ...]
    correct_index: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    post: Mapped["Post"] = relationship(back_populates="mcq")


class Flashcard(Base):
    """Front/back payload for a Post with content_type=FLASHCARD."""
    __tablename__ = "flashcards"

    id: Mapped[uuid.UUID] = uuid_pk()
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), unique=True, index=True)

    front: Mapped[str] = mapped_column(Text, nullable=False)
    back: Mapped[str] = mapped_column(Text, nullable=False)
    flip_threshold_sec: Mapped[float | None] = mapped_column(Float, nullable=True)  # dwell before flip counts as "studied"

    post: Mapped["Post"] = relationship(back_populates="flashcard")


# Tags
# ------------------------------------------------------------
# Free-form labels on top of the Topic taxonomy; used as retrieval /
# ranker features and for tag-based feeds.

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    primary_topic_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    posts: Mapped[list["Post"]] = relationship(secondary="post_tags", back_populates="tags")


class PostTag(Base):
    """Many-to-many association between posts and tags."""
    __tablename__ = "post_tags"
    __table_args__ = (UniqueConstraint("post_id", "tag_id", name="uq_post_tag"),)

    id: Mapped[uuid.UUID] = uuid_pk()
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    tag_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tags.id", ondelete="CASCADE"), index=True)


# Telemetry
# ------------------------------------------------------------
# Raw per-user x per-post engagement events. This is the ground-truth signal
# the whole "telemetry-driven" engine is built on: the content ranker's
# features and the ALS user-item matrix are both derived from these rows.
# The denormalized counters on Post are aggregates of this table.

class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)

    # where/how the post was served -> lets the ranker de-bias position effects
    surface: Mapped[InteractionSurface] = mapped_column(Enum(InteractionSurface), default=InteractionSurface.FEED, index=True)
    feed_position: Mapped[int | None] = mapped_column(Integer, nullable=True)  # rank slot the user saw it at

    # engagement telemetry
    dwell_time_sec: Mapped[float] = mapped_column(Float, default=0.0)          # time the post was on screen
    scroll_depth: Mapped[float | None] = mapped_column(Float, nullable=True)   # 0..1 for long text posts
    completion_ratio: Mapped[float] = mapped_column(Float, default=0.0)        # dwell / est_read_seconds, clamped 0..1
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # implicit-feedback strength precomputed for CF/ALS (e.g. weighted engagement)
    engagement_weight: Mapped[float] = mapped_column(Float, default=0.0)

    # per-content-type telemetry signals so every ML feature is reconstructable
    # from stored rows (nullable: only meaningful for the relevant content type).
    quiz_answered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)   # mcq: did the user answer
    quiz_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)    # mcq: was the answer correct
    card_flipped: Mapped[bool | None] = mapped_column(Boolean, nullable=True)    # flashcard: did the user flip
    flip_time_sec: Mapped[float | None] = mapped_column(Float, nullable=True)    # flashcard: dwell before flip

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    post: Mapped["Post"] = relationship(back_populates="interactions")

    __table_args__ = (
        Index("ix_interactions_user_created", "user_id", "created_at"),
        Index("ix_interactions_post_created", "post_id", "created_at"),
    )
 
 
class Vote(Base):
    """Current vote state per user/post (one row per pair, upsert on change)."""
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_vote_pair"),)
 
    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    value: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # +1 / -1
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
 
    post: Mapped["Post"] = relationship(back_populates="votes")
 
 
class SavedPost(Base):
    __tablename__ = "saved_posts"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_save_pair"),)
 
    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
 
 
class Comment(Base):
    __tablename__ = "comments"
 
    id: Mapped[uuid.UUID] = uuid_pk()
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    parent_comment_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
 
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
 
    post: Mapped["Post"] = relationship(back_populates="comments")
    
 