import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume, ResumeAnalysis
from ..schemas.assistant import ChatRequest, ChatResponse
from ..ai.career_assistant import AICareerAssistant
from ..ai.skill_analyzer import AISkillAnalyzer
from ..utils.security import get_current_user

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

def safe_parse_json(val, default):
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch user active resume context
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()

    resume_score = 85
    detected_skills = ["Python", "PyTorch", "SQL", "Git", "FastAPI"]
    missing_skills = ["Docker", "AWS", "Kubernetes"]

    if resume:
        analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
        if analysis:
            resume_score = analysis.overall_score
            detected_skills = safe_parse_json(analysis.extracted_skills, detected_skills)
            missing_skills = safe_parse_json(analysis.missing_critical_skills, missing_skills)

    target_role = current_user.target_role or "AI Engineer"

    response = AICareerAssistant.generate_response(
        message=request.message,
        user_name=current_user.name.split()[0],
        target_role=target_role,
        resume_score=resume_score,
        detected_skills=detected_skills,
        missing_skills=missing_skills
    )

    return response
