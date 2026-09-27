from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    work_type: str
    experience_level: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    description: str
    required_skills: List[str]
    preferred_skills: List[str] = []
    industry: str = "Technology"
    logo_url: Optional[str] = None
    source: str = "CareerAI Direct"

class JobResponse(JobBase):
    id: int
    created_at: datetime
    is_saved: Optional[bool] = False
    match_percentage: Optional[int] = None
    matched_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []

    model_config = ConfigDict(from_attributes=True)

class MatchScoreBreakdown(BaseModel):
    skills_match: int
    experience_match: int
    education_match: int
    project_match: int
    keyword_match: int
    weights: Dict[str, str]

class JobMatchDetailResponse(BaseModel):
    job: JobResponse
    overall_match: int
    breakdown: MatchScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    fit_summary: str
    recommendation: str

class SavedJobResponse(BaseModel):
    id: int
    job_id: int
    saved_at: datetime
    job: JobResponse

    model_config = ConfigDict(from_attributes=True)
