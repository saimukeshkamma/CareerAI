from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from .job import JobResponse
from .resume import ResumeResponse

class ScoreHistoryPoint(BaseModel):
    date: str
    resume_score: Optional[int] = None
    interview_score: Optional[int] = None

class SkillGapItem(BaseModel):
    skill: str
    importance: str  # Critical, High, Medium
    category: str
    difficulty: str   # Beginner, Intermediate, Advanced
    why_it_matters: str
    learning_path: str
    resources: List[Dict[str, str]]

class DashboardSummaryResponse(BaseModel):
    user_name: str
    target_role: str
    active_resume_score: Optional[int] = None
    ats_score: Optional[int] = None
    job_matches_count: int = 0
    average_interview_score: Optional[int] = None
    skills_identified_count: int = 0
    recent_resume: Optional[ResumeResponse] = None
    recommended_jobs: List[JobResponse] = []
    top_skill_gaps: List[SkillGapItem] = []
    recent_interview_score: Optional[int] = None
    career_insight: str

class AnalyticsOverviewResponse(BaseModel):
    score_trends: List[ScoreHistoryPoint]
    category_radar: List[Dict[str, Any]]
    interview_performance: Dict[str, int]
    skill_growth: List[Dict[str, Any]]
    job_market_demand: List[Dict[str, Any]]
    overall_readiness_index: int
