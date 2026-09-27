from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class BulletRewrite(BaseModel):
    original: str
    suggested: str
    impact_reason: str

class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: int
    ats_score: int
    skills_score: int
    experience_score: int
    education_score: int
    formatting_score: int
    keywords_score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    extracted_skills: List[str]
    missing_critical_skills: List[str]
    bullet_rewrites: List[BulletRewrite]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    filename: str
    file_type: str
    file_size: int
    is_active: bool
    uploaded_at: datetime
    latest_analysis: Optional[ResumeAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ResumeTextParseResult(BaseModel):
    title: str
    raw_text: str
    skills: List[str]
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    contact: Dict[str, Any]
