import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Try loading from current directory first, then from 'backend' subfolder
if os.path.exists(".env"):
    load_dotenv(".env")
elif os.path.exists("backend/.env"):
    load_dotenv("backend/.env")
else:
    # If we are inside backend/, look one level up
    load_dotenv("../.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/startup_box")

# Log connection target (redacting password)
clean_url = DATABASE_URL
if "@" in clean_url:
    prefix, suffix = clean_url.split("@", 1)
    if ":" in prefix.split("//")[1]:
        protocol, creds = prefix.split("//")
        user, _ = creds.split(":")
        clean_url = f"{protocol}//{user}:****@{suffix}"

import uuid
server_id = str(uuid.uuid4())[:8]
print(f"INFO: [Server {server_id}] Connecting to database: {clean_url}")

engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    pool_pre_ping=True,      # Check connection health before use
    pool_recycle=3600,       # Recycle connections every hour
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
