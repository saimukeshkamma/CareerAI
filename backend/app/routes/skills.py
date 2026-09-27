import json
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume, ResumeAnalysis
from ..ai.skill_analyzer import AISkillAnalyzer
from ..utils.security import get_current_user

router = APIRouter(prefix="/skills", tags=["Skills"])

def safe_parse_json(val, default):
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

@router.get("/gaps")
def get_skill_gaps(
    role: Optional[str] = Query(None, description="Target job title to evaluate skill gaps against"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_role = role or current_user.target_role or "AI Engineer"

    # Get user skills from active resume
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()

    user_skills = []
    if resume:
        analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
        if analysis and analysis.extracted_skills:
            user_skills = safe_parse_json(analysis.extracted_skills, [])
        elif resume.parsed_data:
            parsed = safe_parse_json(resume.parsed_data, {})
            user_skills = parsed.get("skills", []) or parsed.get("detected_skills", [])

    gaps = AISkillAnalyzer.get_skill_gaps(user_skills, target_role=target_role)

    return {
        "target_role": target_role,
        "user_skills_identified": user_skills,
        "total_skills_count": len(user_skills),
        "missing_skills_count": len(gaps),
        "gaps": gaps
    }
