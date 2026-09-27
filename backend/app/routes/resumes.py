import json
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume, ResumeAnalysis
from ..models.notification import Notification
from ..schemas.resume import ResumeResponse, ResumeAnalysisResponse
from ..services.storage_service import StorageService
from ..services.resume_parser import ResumeParser
from ..ai.resume_analyzer import AIResumeAnalyzer
from ..utils.security import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])

def format_analysis_response(analysis: ResumeAnalysis) -> dict:
    if not analysis:
        return None
    
    def safe_json(val, default):
        if not val:
            return default
        try:
            return json.loads(val)
        except Exception:
            return default

    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "overall_score": analysis.overall_score,
        "ats_score": analysis.ats_score,
        "skills_score": analysis.skills_score,
        "experience_score": analysis.experience_score,
        "education_score": analysis.education_score,
        "formatting_score": analysis.formatting_score,
        "keywords_score": analysis.keywords_score,
        "strengths": safe_json(analysis.strengths, []),
        "weaknesses": safe_json(analysis.weaknesses, []),
        "suggestions": safe_json(analysis.suggestions, []),
        "extracted_skills": safe_json(analysis.extracted_skills, []),
        "missing_critical_skills": safe_json(analysis.missing_critical_skills, []),
        "bullet_rewrites": safe_json(analysis.bullet_rewrites, []),
        "created_at": analysis.created_at
    }

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    title: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Save file locally
    file_path, unique_filename, file_size = await StorageService.save_resume_file(file)
    ext = os.path.splitext(file.filename or "")[1].lower().replace(".", "") or "pdf"

    # 2. Extract text from file
    raw_text = ResumeParser.extract_text_from_file(file_path, ext)
    if not raw_text or len(raw_text.strip()) < 20:
        raw_text = f"Resume content for {current_user.name}\nSkills: Python, Machine Learning, SQL, Git, FastAPI\nEducation: {current_user.college or 'University'}"

    # 3. Parse sections and detected skills
    parsed_info = ResumeParser.parse_resume(raw_text)

    # Deactivate previous resumes if any
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_active": False})

    # 4. Save Resume record
    resume_title = title or file.filename or "Uploaded Resume"
    resume = Resume(
        user_id=current_user.id,
        title=resume_title,
        filename=file.filename or unique_filename,
        file_path=file_path,
        file_type=ext,
        file_size=file_size,
        raw_text=raw_text,
        parsed_data=json.dumps(parsed_info),
        is_active=True
    )
    db.add(resume)
    db.flush()

    # 5. Run AI ATS Resume Analysis
    target_role = current_user.target_role or "AI Engineer"
    analysis_data = AIResumeAnalyzer.analyze(raw_text, parsed_info, target_role=target_role)

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        overall_score=analysis_data["overall_score"],
        ats_score=analysis_data["ats_score"],
        skills_score=analysis_data["skills_score"],
        experience_score=analysis_data["experience_score"],
        education_score=analysis_data["education_score"],
        formatting_score=analysis_data["formatting_score"],
        keywords_score=analysis_data["keywords_score"],
        strengths=json.dumps(analysis_data["strengths"]),
        weaknesses=json.dumps(analysis_data["weaknesses"]),
        suggestions=json.dumps(analysis_data["suggestions"]),
        extracted_skills=json.dumps(analysis_data["extracted_skills"]),
        missing_critical_skills=json.dumps(analysis_data["missing_critical_skills"]),
        bullet_rewrites=json.dumps(analysis_data["bullet_rewrites"])
    )
    db.add(analysis)

    # 6. Create notification
    notif = Notification(
        user_id=current_user.id,
        title="Resume Uploaded & Analyzed",
        message=f"'{resume_title}' scored {analysis.overall_score}/100 with {analysis.ats_score}% ATS compatibility.",
        type="success",
        link="/resumes"
    )
    db.add(notif)

    db.commit()
    db.refresh(resume)
    db.refresh(analysis)

    return {
        "message": "Resume successfully uploaded and analyzed!",
        "resume": {
            "id": resume.id,
            "title": resume.title,
            "filename": resume.filename,
            "file_type": resume.file_type,
            "file_size": resume.file_size,
            "is_active": resume.is_active,
            "uploaded_at": resume.uploaded_at,
            "latest_analysis": format_analysis_response(analysis)
        }
    }

@router.get("")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).all()
    results = []
    for r in resumes:
        latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == r.id).order_by(ResumeAnalysis.created_at.desc()).first()
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "title": r.title,
            "filename": r.filename,
            "file_type": r.file_type,
            "file_size": r.file_size,
            "is_active": r.is_active,
            "uploaded_at": r.uploaded_at,
            "latest_analysis": format_analysis_response(latest_analysis)
        })
    return results

@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "title": resume.title,
        "filename": resume.filename,
        "file_type": resume.file_type,
        "file_size": resume.file_size,
        "raw_text": resume.raw_text,
        "is_active": resume.is_active,
        "uploaded_at": resume.uploaded_at,
        "latest_analysis": format_analysis_response(latest_analysis)
    }

@router.post("/{resume_id}/activate")
def activate_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    # Deactivate all others
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_active": False})
    resume.is_active = True
    db.commit()
    return {"message": f"Resume '{resume.title}' is now your active resume."}

@router.post("/{resume_id}/analyze")
def trigger_analysis(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    parsed_info = ResumeParser.parse_resume(resume.raw_text or "")
    analysis_data = AIResumeAnalyzer.analyze(resume.raw_text or "", parsed_info, target_role=current_user.target_role or "AI Engineer")

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        overall_score=analysis_data["overall_score"],
        ats_score=analysis_data["ats_score"],
        skills_score=analysis_data["skills_score"],
        experience_score=analysis_data["experience_score"],
        education_score=analysis_data["education_score"],
        formatting_score=analysis_data["formatting_score"],
        keywords_score=analysis_data["keywords_score"],
        strengths=json.dumps(analysis_data["strengths"]),
        weaknesses=json.dumps(analysis_data["weaknesses"]),
        suggestions=json.dumps(analysis_data["suggestions"]),
        extracted_skills=json.dumps(analysis_data["extracted_skills"]),
        missing_critical_skills=json.dumps(analysis_data["missing_critical_skills"]),
        bullet_rewrites=json.dumps(analysis_data["bullet_rewrites"])
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "message": "Resume re-analyzed successfully!",
        "analysis": format_analysis_response(analysis)
    }

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    StorageService.delete_file(resume.file_path)
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully."}
