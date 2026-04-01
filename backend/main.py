from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sys

from presentation.api.routes_startup import router as startup_router
from presentation.api.routes_auth import router as auth_router
from presentation.api.routes_admin import router as admin_router
from infrastructure.database.session import engine
from infrastructure.database.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("INFO: Initializing database...")
    try:
        async with engine.begin() as conn:
            # For MVP we can auto-create tables
            await conn.run_sync(Base.metadata.create_all)
        print("INFO: Database initialized successfully.")
    except Exception as e:
        print(f"ERROR: Database initialization failed: {e}")
        # Not exiting here to allow for manual fixes, but you'll see the error
    
    yield
    # Shutdown logic
    await engine.dispose()

app = FastAPI(title="Startup-in-a-Box AI", version="1.0.0", lifespan=lifespan)

# CORS Configuration: Strictly dynamic from environment
cors_origins_raw = os.getenv("CORS_ORIGINS", "")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(startup_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}
