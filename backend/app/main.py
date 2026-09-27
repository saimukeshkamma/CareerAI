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

def ensure_schema_migrations():
    """Ensure SQLite schema has newly added columns without requiring manual migrations."""
    with engine.connect() as conn:
        try:
            result = conn.exec_driver_sql("PRAGMA table_info(users)")
            existing_cols = {row[1] for row in result.fetchall()}
            
            new_columns = [
                ("headline", "VARCHAR(200)"),
                ("github_url", "VARCHAR(255)"),
                ("linkedin_url", "VARCHAR(255)"),
                ("portfolio_url", "VARCHAR(255)"),
                ("twitter_url", "VARCHAR(255)"),
                ("skills", "TEXT"),
                ("preferred_work_type", "VARCHAR(50) DEFAULT 'Remote'"),
                ("preferred_job_type", "VARCHAR(50) DEFAULT 'Full-time'"),
                ("salary_expectation", "VARCHAR(100)"),
                ("availability", "VARCHAR(50) DEFAULT 'Immediate'"),
            ]
            
            for col_name, col_type in new_columns:
                if col_name not in existing_cols:
                    conn.exec_driver_sql(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            conn.commit()
        except Exception:
            pass

# Create tables and seed data on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations()
    
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
