import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, default="My Resume")
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt
    file_size = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(Text, nullable=True)  # JSON string of extracted sections
    is_active = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="resume")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score = Column(Integer, nullable=False, default=80)
    ats_score = Column(Integer, nullable=False, default=85)
    skills_score = Column(Integer, nullable=False, default=80)
    experience_score = Column(Integer, nullable=False, default=75)
    education_score = Column(Integer, nullable=False, default=90)
    formatting_score = Column(Integer, nullable=False, default=88)
    keywords_score = Column(Integer, nullable=False, default=82)
    
    strengths = Column(Text, nullable=True)  # JSON string
    weaknesses = Column(Text, nullable=True)  # JSON string
    suggestions = Column(Text, nullable=True)  # JSON string
    extracted_skills = Column(Text, nullable=True)  # JSON string: list of skills
    missing_critical_skills = Column(Text, nullable=True)  # JSON string
    bullet_rewrites = Column(Text, nullable=True)  # JSON string: before/after suggestions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
