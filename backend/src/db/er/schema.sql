-- Knova database schema (generated from src/db/models.py)
-- PostgreSQL + pgvector. Use this to generate an ER diagram.

CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
-- -----------------------------------------------------
CREATE TYPE oauthprovider AS ENUM ('google', 'facebook');
CREATE TYPE contenttype AS ENUM ('text', 'mcq', 'flashcard', 'short_note');
CREATE TYPE interactionsurface AS ENUM ('feed', 'profile', 'search', 'topic', 'saved');


-- Auth
-- -----------------------------------------------------
CREATE TABLE users (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ext_id               INTEGER UNIQUE,
    email                VARCHAR(255) NOT NULL UNIQUE,
    password_hash        VARCHAR(255),
    username             VARCHAR(50) NOT NULL DEFAULT 'Username',
    avatar_url           VARCHAR(512),
    bio                  VARCHAR(500),
    is_active            BOOLEAN DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMP DEFAULT now(),
    updated_at           TIMESTAMP DEFAULT now(),
    last_active_at       TIMESTAMP,
    interest_embedding   VECTOR(384),
    estimated_expertise  DOUBLE PRECISION DEFAULT 0.5,
    curiosity_score      DOUBLE PRECISION DEFAULT 0.5
);
CREATE INDEX ix_users_ext_id ON users (ext_id);
CREATE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_username ON users (username);


CREATE TABLE oauth (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider         oauthprovider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token     TEXT,
    refresh_token    TEXT,
    created_at       TIMESTAMP DEFAULT now()
);
CREATE INDEX ix_oauth_user_id ON oauth (user_id);


-- Creator
-- -----------------------------------------------------
CREATE TABLE creatorprofiles (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    ext_id                INTEGER UNIQUE,
    headline              VARCHAR(150),
    credentials           TEXT,
    primary_topics        JSONB,
    authority_score       DOUBLE PRECISION DEFAULT 0.0,
    follower_count        INTEGER DEFAULT 0,
    avg_post_upvote_rate  DOUBLE PRECISION DEFAULT 0.0,
    is_verified_educator  BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMP DEFAULT now()
);
CREATE INDEX ix_creatorprofiles_user_id ON creatorprofiles (user_id);
CREATE INDEX ix_creatorprofiles_ext_id ON creatorprofiles (ext_id);


CREATE TABLE creator_follows (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id  UUID NOT NULL REFERENCES creatorprofiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT now(),
    CONSTRAINT uq_follow_pair UNIQUE (follower_id, creator_id)
);
CREATE INDEX ix_creator_follows_follower_id ON creator_follows (follower_id);
CREATE INDEX ix_creator_follows_creator_id ON creator_follows (creator_id);


-- Topics
-- -----------------------------------------------------
CREATE TABLE topics (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name      VARCHAR(80) NOT NULL UNIQUE,
    parent_id UUID REFERENCES topics(id)
);


CREATE TABLE user_topic_interests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id       UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    affinity_score DOUBLE PRECISION DEFAULT 0.0,
    source         VARCHAR(30),
    updated_at     TIMESTAMP DEFAULT now(),
    CONSTRAINT uq_user_topic UNIQUE (user_id, topic_id)
);
CREATE INDEX ix_user_topic_interests_user_id ON user_topic_interests (user_id);
CREATE INDEX ix_user_topic_interests_topic_id ON user_topic_interests (topic_id);


-- Posts
-- -----------------------------------------------------
CREATE TABLE posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ext_id              INTEGER,
    creator_id          UUID NOT NULL REFERENCES creatorprofiles(id) ON DELETE CASCADE,
    content_type        contenttype DEFAULT 'text',
    title               VARCHAR(200),
    body                TEXT NOT NULL,
    word_count          INTEGER DEFAULT 0,
    est_read_seconds    INTEGER DEFAULT 0,
    difficulty          DOUBLE PRECISION DEFAULT 0.5,
    topic_id            UUID REFERENCES topics(id),
    embedding           VECTOR(384),
    status              VARCHAR(20) DEFAULT 'published',
    published_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT now(),
    updated_at          TIMESTAMP DEFAULT now(),
    impression_count    INTEGER DEFAULT 0,
    read_complete_count INTEGER DEFAULT 0,
    upvote_count        INTEGER DEFAULT 0,
    downvote_count      INTEGER DEFAULT 0,
    comment_count       INTEGER DEFAULT 0,
    save_count          INTEGER DEFAULT 0,
    share_count         INTEGER DEFAULT 0
);
CREATE INDEX ix_posts_ext_id ON posts (ext_id);
CREATE INDEX ix_posts_creator_id ON posts (creator_id);
CREATE INDEX ix_posts_content_type ON posts (content_type);
CREATE INDEX ix_posts_topic_id ON posts (topic_id);
CREATE INDEX ix_posts_topic_published ON posts (topic_id, published_at);


-- Content-type payloads
-- -----------------------------------------------------
CREATE TABLE mcqs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id       UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    question      TEXT NOT NULL,
    options       JSONB NOT NULL,
    correct_index SMALLINT NOT NULL,
    explanation   TEXT
);
CREATE INDEX ix_mcqs_post_id ON mcqs (post_id);


CREATE TABLE flashcards (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id           UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    front             TEXT NOT NULL,
    back              TEXT NOT NULL,
    flip_threshold_sec DOUBLE PRECISION
);
CREATE INDEX ix_flashcards_post_id ON flashcards (post_id);


-- Tags
-- -----------------------------------------------------
CREATE TABLE tags (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(80) NOT NULL UNIQUE,
    primary_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    created_at       TIMESTAMP DEFAULT now()
);
CREATE INDEX ix_tags_name ON tags (name);
CREATE INDEX ix_tags_primary_topic_id ON tags (primary_topic_id);


CREATE TABLE post_tags (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT uq_post_tag UNIQUE (post_id, tag_id)
);
CREATE INDEX ix_post_tags_post_id ON post_tags (post_id);
CREATE INDEX ix_post_tags_tag_id ON post_tags (tag_id);


-- Telemetry
-- -----------------------------------------------------
CREATE TABLE interactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    surface           interactionsurface DEFAULT 'feed',
    feed_position     INTEGER,
    dwell_time_sec    DOUBLE PRECISION DEFAULT 0.0,
    scroll_depth      DOUBLE PRECISION,
    completion_ratio  DOUBLE PRECISION DEFAULT 0.0,
    is_completed      BOOLEAN DEFAULT FALSE,
    engagement_weight DOUBLE PRECISION DEFAULT 0.0,
    quiz_answered     BOOLEAN,
    quiz_correct      BOOLEAN,
    card_flipped      BOOLEAN,
    flip_time_sec     DOUBLE PRECISION,
    created_at        TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_interactions_user_id ON interactions (user_id);
CREATE INDEX ix_interactions_post_id ON interactions (post_id);
CREATE INDEX ix_interactions_surface ON interactions (surface);
CREATE INDEX ix_interactions_user_created ON interactions (user_id, created_at);
CREATE INDEX ix_interactions_post_created ON interactions (post_id, created_at);


CREATE TABLE votes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    value      SMALLINT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT uq_vote_pair UNIQUE (user_id, post_id)
);
CREATE INDEX ix_votes_user_id ON votes (user_id);
CREATE INDEX ix_votes_post_id ON votes (post_id);


CREATE TABLE saved_posts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_save_pair UNIQUE (user_id, post_id)
);
CREATE INDEX ix_saved_posts_user_id ON saved_posts (user_id);
CREATE INDEX ix_saved_posts_post_id ON saved_posts (post_id);


CREATE TABLE comments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    body              TEXT NOT NULL,
    created_at        TIMESTAMP DEFAULT now()
);
CREATE INDEX ix_comments_post_id ON comments (post_id);
CREATE INDEX ix_comments_user_id ON comments (user_id);
