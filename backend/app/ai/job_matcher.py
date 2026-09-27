import json
from typing import Dict, Any, List

class AIJobMatcher:
    # Configurable weighting scheme
    WEIGHTS = {
        "skills": 0.40,
        "experience": 0.20,
        "projects": 0.15,
        "education": 0.10,
        "keywords": 0.10,
        "location_type": 0.05
    }

    @classmethod
    def match(
        cls,
        resume_skills: List[str],
        resume_text: str,
        job: Any,
        user_experience_level: str = "Entry-level"
    ) -> Dict[str, Any]:
        resume_skills_lower = set(s.lower() for s in resume_skills)
        resume_text_lower = (resume_text or "").lower()

        # Parse job required skills
        req_skills_raw = job.required_skills
        if isinstance(req_skills_raw, str):
            try:
                req_skills = json.loads(req_skills_raw)
            except Exception:
                req_skills = [s.strip() for s in req_skills_raw.split(",") if s.strip()]
        else:
            req_skills = req_skills_raw or []

        matched_skills = []
        missing_skills = []

        for req in req_skills:
            if req.lower() in resume_skills_lower or req.lower() in resume_text_lower:
                matched_skills.append(req)
            else:
                missing_skills.append(req)

        # 1. Skills Match Score (0 - 100)
        if req_skills:
            skills_score = int((len(matched_skills) / len(req_skills)) * 100)
        else:
            skills_score = 80

        # 2. Experience Match Score
        job_exp = (job.experience_level or "Entry-level").lower()
        user_exp = (user_experience_level or "Entry-level").lower()
        
        if "intern" in job_exp or "entry" in job_exp:
            exp_score = 90
        elif "mid" in job_exp:
            exp_score = 80 if "mid" in user_exp or "senior" in user_exp else 68
        elif "senior" in job_exp:
            exp_score = 85 if "senior" in user_exp else 55
        else:
            exp_score = 75

        # 3. Project Match Score
        project_keywords = ["github", "project", "deployed", "pipeline", "model", "app", "api"]
        proj_hits = sum(1 for pk in project_keywords if pk in resume_text_lower)
        project_score = min(95, max(60, 60 + proj_hits * 5))

        # 4. Education Match Score
        education_score = 88 if any(ed in resume_text_lower for ed in ["bachelor", "master", "b.tech", "b.s.", "m.s.", "computer science", "engineering"]) else 72

        # 5. Keyword & Description Alignment Score
        job_desc_sample = (job.description or "").lower().split()
        important_terms = [w for w in job_desc_sample if len(w) > 5 and w.isalpha()][:20]
        term_hits = sum(1 for t in important_terms if t in resume_text_lower)
        keyword_score = min(95, max(50, int((term_hits / max(1, len(important_terms))) * 100)))

        # 6. Location & Work Type
        location_score = 95 if job.work_type in ["Remote", "Hybrid"] else 85

        # Overall Weighted Composite
        overall_match = int(
            skills_score * cls.WEIGHTS["skills"] +
            exp_score * cls.WEIGHTS["experience"] +
            project_score * cls.WEIGHTS["projects"] +
            education_score * cls.WEIGHTS["education"] +
            keyword_score * cls.WEIGHTS["keywords"] +
            location_score * cls.WEIGHTS["location_type"]
        )
        overall_match = min(99, max(35, overall_match))

        # Explainable Summary
        if overall_match >= 85:
            fit_summary = f"Exceptional match for {job.title}. Your resume highlights {len(matched_skills)} core technical skills required by {job.company}."
            recommendation = "Strong candidate profile. Highlight your direct projects in your application cover letter."
        elif overall_match >= 70:
            fit_summary = f"Solid fit for {job.title}. You meet key foundational requirements with {len(matched_skills)} matching skills."
            recommendation = f"Bridge the gap by practicing {', '.join(missing_skills[:2]) if missing_skills else 'system design'} before interviewing."
        else:
            fit_summary = f"Emerging match for {job.title}. Role requires specialized capabilities that are currently missing in your resume."
            recommendation = f"Consider upskilling in {', '.join(missing_skills[:3]) if missing_skills else 'core stack'} or targeting an internship role."

        return {
            "overall_match": overall_match,
            "skills_score": skills_score,
            "experience_score": exp_score,
            "education_score": education_score,
            "project_score": project_score,
            "keyword_score": keyword_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "fit_summary": fit_summary,
            "recommendation": recommendation,
            "weights": {
                "Skills Match": "40%",
                "Experience Alignment": "20%",
                "Project Depth": "15%",
                "Education Fit": "10%",
                "Keyword Coverage": "10%",
                "Work Mode / Location": "5%"
            }
        }
