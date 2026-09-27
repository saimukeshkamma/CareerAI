import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    company = Column(String(150), nullable=False, index=True)
    location = Column(String(150), nullable=False)
    work_type = Column(String(50), default="Hybrid")  # Remote, Hybrid, On-site
    experience_level = Column(String(50), default="Entry-level") # Internship, Entry-level, Mid-level, Senior
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String(10), default="USD")
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False)  # JSON string list
    preferred_skills = Column(Text, nullable=True)  # JSON string list
    industry = Column(String(100), default="Technology")
    logo_url = Column(String(300), nullable=True)
    source = Column(String(100), default="CareerAI Direct")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    
    match_percentage = Column(Integer, nullable=False, default=75)
    skills_score = Column(Integer, default=70)
    experience_score = Column(Integer, default=70)
    education_score = Column(Integer, default=80)
    
    matched_skills = Column(Text, nullable=True)  # JSON string list
    missing_skills = Column(Text, nullable=True)  # JSON string list
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="job_matches")
    job = relationship("Job", back_populates="matches")
    resume = relationship("Resume", back_populates="job_matches")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")
