import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume, ResumeAnalysis
from ..models.interview import Interview
from ..models.learning import UserLearningProgress
from ..models.job import JobMatch
from ..schemas.user import UserResponse, UserUpdate, ProfileStatsResponse
from ..utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/avatar", response_model=UserResponse)
def update_avatar(
    payload: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    avatar_url = payload.get("profile_photo")
    if not avatar_url:
        raise HTTPException(status_code=400, detail="profile_photo URL is required")
    current_user.profile_photo = avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/stats", response_model=ProfileStatsResponse)
def get_profile_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Calculate profile completion items and strength score
    completion_items = []
    score = 0

    # Personal info (10)
    has_personal = bool(current_user.name and (current_user.phone or current_user.location))
    completion_items.append({
        "id": "personal",
        "title": "Contact & Location",
        "completed": has_personal,
        "points": 10,
        "tip": "Add phone number and city/location to help recruiters connect."
    })
    if has_personal: score += 10

    # Headline (10)
    has_headline = bool(current_user.headline and len(current_user.headline.strip()) > 5)
    completion_items.append({
        "id": "headline",
        "title": "Professional Headline",
        "completed": has_headline,
        "points": 10,
        "tip": "Highlight your core expertise or target job title."
    })
    if has_headline: score += 10

    # Bio (10)
    has_bio = bool(current_user.bio and len(current_user.bio.strip()) > 15)
    completion_items.append({
        "id": "bio",
        "title": "Elevator Pitch / Bio",
        "completed": has_bio,
        "points": 10,
        "tip": "Write 2-3 sentences summarizing your career passion and goals."
    })
    if has_bio: score += 10

    # Profile Photo (10)
    has_photo = bool(current_user.profile_photo)
    completion_items.append({
        "id": "photo",
        "title": "Profile Avatar",
        "completed": has_photo,
        "points": 10,
        "tip": "Choose a tech avatar or provide your portrait photo."
    })
    if has_photo: score += 10

    # Social links (10)
    has_social = bool(current_user.github_url or current_user.linkedin_url or current_user.portfolio_url)
    completion_items.append({
        "id": "social",
        "title": "Portfolio & Social Profiles",
        "completed": has_social,
        "points": 10,
        "tip": "Link your GitHub, LinkedIn, or personal portfolio."
    })
    if has_social: score += 10

    # Education (10)
    has_education = bool(current_user.college and current_user.degree)
    completion_items.append({
        "id": "education",
        "title": "Education Details",
        "completed": has_education,
        "points": 10,
        "tip": "List your university, degree, and expected graduation year."
    })
    if has_education: score += 10

    # Career Preferences (10)
    has_pref = bool(current_user.target_role and current_user.experience_level)
    completion_items.append({
        "id": "preferences",
        "title": "Target Role & Preferences",
        "completed": has_pref,
        "points": 10,
        "tip": "Set your desired role, seniority level, and remote/work preference."
    })
    if has_pref: score += 10

    # Technical Skills (10)
    skills_list = [s.strip() for s in (current_user.skills or "").split(",") if s.strip()]
    has_skills = len(skills_list) >= 3
    completion_items.append({
        "id": "skills",
        "title": "Technical Skill Badges",
        "completed": has_skills,
        "points": 10,
        "tip": "Add at least 3 core technical skills or frameworks."
    })
    if has_skills: score += 10

    # Active Resume (10)
    active_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    if not active_resume:
        active_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    
    resume_summary = None
    if active_resume:
        score += 10
        analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == active_resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
        resume_summary = {
            "id": active_resume.id,
            "title": active_resume.title or active_resume.filename,
            "overall_score": analysis.overall_score if analysis else None,
            "ats_score": analysis.ats_score if analysis else None
        }

    completion_items.append({
        "id": "resume",
        "title": "Active Resume Analyzed",
        "completed": active_resume is not None,
        "points": 10,
        "tip": "Upload and activate your resume for AI ATS scoring."
    })

    # Mock Interview (10)
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    completed_interviews = [i for i in interviews if i.status == "COMPLETED"]
    has_interview = len(completed_interviews) > 0
    if has_interview: score += 10

    completion_items.append({
        "id": "interview",
        "title": "Mock Interview Completed",
        "completed": has_interview,
        "points": 10,
        "tip": "Complete an AI mock interview to test your readiness."
    })

    interview_summary = None
    if completed_interviews:
        scores = [i.overall_score for i in completed_interviews if i.overall_score is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
        latest = max(completed_interviews, key=lambda x: x.created_at)
        interview_summary = {
            "total_completed": len(completed_interviews),
            "avg_score": avg_score,
            "latest_role": latest.job_role or current_user.target_role,
            "latest_score": latest.overall_score
        }

    # Learning Progress Summary
    learning_records = db.query(UserLearningProgress).filter(UserLearningProgress.user_id == current_user.id).all()
    learning_summary = {
        "completed_count": sum(1 for r in learning_records if r.status == "COMPLETED" or r.progress >= 100),
        "in_progress_count": sum(1 for r in learning_records if r.status == "IN_PROGRESS" and r.progress < 100),
        "saved_count": sum(1 for r in learning_records if r.is_saved)
    }

    # Job Matches Count
    job_matches_count = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).count()

    # Determine Label
    if score >= 90:
        label = "All-Star Candidate"
    elif score >= 70:
        label = "Proficient"
    elif score >= 50:
        label = "Intermediate"
    else:
        label = "Needs Optimization"

    return {
        "profile_strength": score,
        "strength_label": label,
        "completion_items": completion_items,
        "active_resume": resume_summary,
        "interview_summary": interview_summary,
        "learning_summary": learning_summary,
        "job_matches_count": job_matches_count
    }

@router.delete("/account")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated resume and interview data have been permanently deleted."}
