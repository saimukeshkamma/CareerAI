from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    experience_level: Optional[str] = "Entry-level"
    target_role: Optional[str] = "AI Engineer"
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    headline: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    twitter_url: Optional[str] = None
    skills: Optional[str] = None
    preferred_work_type: Optional[str] = "Remote"
    preferred_job_type: Optional[str] = "Full-time"
    salary_expectation: Optional[str] = None
    availability: Optional[str] = "Immediate"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    experience_level: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    headline: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    twitter_url: Optional[str] = None
    skills: Optional[str] = None
    preferred_work_type: Optional[str] = None
    preferred_job_type: Optional[str] = None
    salary_expectation: Optional[str] = None
    availability: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProfileStatsResponse(BaseModel):
    profile_strength: int
    strength_label: str
    completion_items: List[Dict[str, Any]]
    active_resume: Optional[Dict[str, Any]] = None
    interview_summary: Optional[Dict[str, Any]] = None
    learning_summary: Optional[Dict[str, Any]] = None
    job_matches_count: int = 0

