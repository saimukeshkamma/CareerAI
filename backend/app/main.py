import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from .config import settings
from .database import engine, SessionLocal, Base
from .seed.seed_data import seed_database

# Import models so SQLAlchemy metadata knows all tables
from .models import (
    User, Resume, ResumeAnalysis, Job, JobMatch,
    SavedJob, Interview, InterviewQuestion, InterviewAnswer, Notification,
    LearningTopic, LearningVideo, UserLearningProgress, InterviewWeakTopic
)

# Import route handlers
from .routes import (
    auth, users, resumes, jobs, skills, interviews, analytics, assistant, notifications, learning
)

# Create tables and seed data on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial jobs and demo users
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    yield

app = FastAPI(
    title="CareerAI API",
    description="AI-Powered Resume, Job Matching & Interview Evaluation System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.STORAGE_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(learning.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareerAI Engine",
        "version": "1.0.0",
        "demo_mode": settings.DEMO_MODE,
        "ai_provider": settings.AI_PROVIDER
    }

@app.get("/")
def root_info():
    return {
        "project": "CareerAI",
        "tagline": "From Resume to Interview — Your AI Career Coach.",
        "docs_url": "/docs",
        "status": "active"
    }

# Global friendly exception handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Never expose internal traces to clients
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal service error occurred. Please try again or contact support."}
    )
