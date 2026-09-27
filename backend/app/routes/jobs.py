import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.job import Job, JobMatch, SavedJob
from ..models.resume import Resume, ResumeAnalysis
from ..ai.job_matcher import AIJobMatcher
from ..utils.security import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

def safe_parse_json(val, default):
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

def get_user_active_resume_data(user_id: int, db: Session):
    resume = db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active == True).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc()).first()
    
    if not resume:
        return [], "", None
    
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
    skills = safe_parse_json(analysis.extracted_skills, []) if analysis else []
    if not skills and resume.parsed_data:
        parsed = safe_parse_json(resume.parsed_data, {})
        skills = parsed.get("skills", []) or parsed.get("detected_skills", [])
    
    return skills, resume.raw_text or "", resume

@router.get("")
def get_jobs(
    q: Optional[str] = Query(None, description="Search by title, company, or skill"),
    work_type: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Job)

    if q:
        search_pattern = f"%{q.lower()}%"
        query = query.filter(
            Job.title.ilike(search_pattern) |
            Job.company.ilike(search_pattern) |
            Job.description.ilike(search_pattern) |
            Job.required_skills.ilike(search_pattern)
        )

    if work_type and work_type != "All":
        query = query.filter(Job.work_type == work_type)

    if experience_level and experience_level != "All":
        query = query.filter(Job.experience_level == experience_level)

    if industry and industry != "All":
        query = query.filter(Job.industry == industry)

    jobs = query.order_by(Job.created_at.desc()).all()

    # Get active resume skills
    user_skills, user_text, _ = get_user_active_resume_data(current_user.id, db)

    # Get user's saved job IDs
    saved_ids = set(r[0] for r in db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all())

    results = []
    for j in jobs:
        match_info = AIJobMatcher.match(
            resume_skills=user_skills,
            resume_text=user_text,
            job=j,
            user_experience_level=current_user.experience_level or "Entry-level"
        )
        
        results.append({
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "work_type": j.work_type,
            "experience_level": j.experience_level,
            "salary_min": j.salary_min,
            "salary_max": j.salary_max,
            "salary_currency": j.salary_currency,
            "description": j.description,
            "required_skills": safe_parse_json(j.required_skills, []),
            "preferred_skills": safe_parse_json(j.preferred_skills, []),
            "industry": j.industry,
            "logo_url": j.logo_url,
            "source": j.source,
            "created_at": j.created_at,
            "is_saved": j.id in saved_ids,
            "match_percentage": match_info["overall_match"],
            "matched_skills": match_info["matched_skills"],
            "missing_skills": match_info["missing_skills"]
        })

    # Sort primarily by match percentage
    results.sort(key=lambda x: x["match_percentage"] or 0, reverse=True)
    return results

@router.get("/saved/all")
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_items = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).order_by(SavedJob.saved_at.desc()).all()
    user_skills, user_text, _ = get_user_active_resume_data(current_user.id, db)

    results = []
    for item in saved_items:
        j = item.job
        match_info = AIJobMatcher.match(
            resume_skills=user_skills,
            resume_text=user_text,
            job=j,
            user_experience_level=current_user.experience_level or "Entry-level"
        )
        results.append({
            "saved_id": item.id,
            "saved_at": item.saved_at,
            "job": {
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "work_type": j.work_type,
                "experience_level": j.experience_level,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "salary_currency": j.salary_currency,
                "description": j.description,
                "required_skills": safe_parse_json(j.required_skills, []),
                "preferred_skills": safe_parse_json(j.preferred_skills, []),
                "industry": j.industry,
                "logo_url": j.logo_url,
                "source": j.source,
                "created_at": j.created_at,
                "is_saved": True,
                "match_percentage": match_info["overall_match"],
                "matched_skills": match_info["matched_skills"],
                "missing_skills": match_info["missing_skills"]
            }
        })
    return results

@router.get("/{job_id}")
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    is_saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first() is not None
    user_skills, user_text, _ = get_user_active_resume_data(current_user.id, db)
    match_info = AIJobMatcher.match(
        resume_skills=user_skills,
        resume_text=user_text,
        job=job,
        user_experience_level=current_user.experience_level or "Entry-level"
    )

    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "work_type": job.work_type,
        "experience_level": job.experience_level,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_currency": job.salary_currency,
        "description": job.description,
        "required_skills": safe_parse_json(job.required_skills, []),
        "preferred_skills": safe_parse_json(job.preferred_skills, []),
        "industry": job.industry,
        "logo_url": job.logo_url,
        "source": job.source,
        "created_at": job.created_at,
        "is_saved": is_saved,
        "match_percentage": match_info["overall_match"],
        "matched_skills": match_info["matched_skills"],
        "missing_skills": match_info["missing_skills"]
    }

@router.get("/{job_id}/match")
def get_match_breakdown(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    user_skills, user_text, resume = get_user_active_resume_data(current_user.id, db)
    match_info = AIJobMatcher.match(
        resume_skills=user_skills,
        resume_text=user_text,
        job=job,
        user_experience_level=current_user.experience_level or "Entry-level"
    )

    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "overall_match": match_info["overall_match"],
        "breakdown": {
            "skills_score": match_info["skills_score"],
            "experience_score": match_info["experience_score"],
            "education_score": match_info["education_score"],
            "project_score": match_info["project_score"],
            "keyword_score": match_info["keyword_score"],
            "weights": match_info["weights"]
        },
        "matched_skills": match_info["matched_skills"],
        "missing_skills": match_info["missing_skills"],
        "fit_summary": match_info["fit_summary"],
        "recommendation": match_info["recommendation"],
        "active_resume_title": resume.title if resume else "None (Upload a resume to boost accuracy)"
    }

@router.post("/{job_id}/save")
def toggle_save_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first()
    if saved:
        db.delete(saved)
        db.commit()
        return {"saved": False, "message": f"Removed '{job.title}' from saved jobs."}
    else:
        new_save = SavedJob(user_id=current_user.id, job_id=job_id)
        db.add(new_save)
        db.commit()
        return {"saved": True, "message": f"Saved '{job.title}' to your saved jobs list."}
