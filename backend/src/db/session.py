from uuid import uuid4

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from core.config import get_database_url, get_settings

settings = get_settings()
engine = create_async_engine(
    get_database_url(async_mode=True),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_timeout=20,
    pool_recycle=1800,
    # Supabase's transaction pooler (pgbouncer) doesn't support server-side
    # prepared statements that persist across transactions. Two caches must be
    # off: asyncpg's own (statement_cache_size) AND SQLAlchemy's asyncpg-dialect
    # cache (prepared_statement_cache_size, default 100) — the latter reuses a
    # prepared statement across transactions, which land on different pgbouncer
    # backends and fail with 'prepared statement ... does not exist'. Unique
    # names avoid collisions when statements are prepared per-execution.
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid4()}__",
    },
)

AsyncSessionLocal = async_sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
