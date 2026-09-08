from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings

# Convert URL dialect for psycopg3 (async).
# NeonDB gives: postgresql+asyncpg://... or postgresql://...
# psycopg async needs: postgresql+psycopg://...
def _fix_url(url: str) -> str:
    for prefix in ("postgresql+asyncpg://", "postgresql+aasyncpg://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    # sqlite for testing — leave as-is
    return url

_url = _fix_url(settings.DATABASE_URL)
_is_sqlite = _url.startswith("sqlite")

_engine_kwargs: dict = {"echo": False}
if not _is_sqlite:
    _engine_kwargs["pool_pre_ping"] = True
    _engine_kwargs["pool_size"] = 5
    _engine_kwargs["max_overflow"] = 10

engine = create_async_engine(_url, **_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
