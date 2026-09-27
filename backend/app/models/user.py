import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(120), nullable=True)
    college = Column(String(200), nullable=True)
    degree = Column(String(120), nullable=True)
    branch = Column(String(120), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    experience_level = Column(String(50), default="Entry-level")  # Student, Entry-level, Mid, Senior
    target_role = Column(String(120), default="AI Engineer")
    bio = Column(Text, nullable=True)
    profile_photo = Column(String(255), nullable=True)
    headline = Column(String(200), nullable=True)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    twitter_url = Column(String(255), nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated or JSON list of skills
    preferred_work_type = Column(String(50), default="Remote")
    preferred_job_type = Column(String(50), default="Full-time")
    salary_expectation = Column(String(100), nullable=True)
    availability = Column(String(50), default="Immediate")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
