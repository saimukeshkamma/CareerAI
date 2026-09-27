import re
from typing import Dict, Any, List

class AIResumeAnalyzer:
    ROLE_KEYWORDS = {
        "AI Engineer": ["python", "pytorch", "tensorflow", "machine learning", "deep learning", "nlp", "llms", "transformers", "docker", "fastapi", "cuda", "vector database"],
        "ML Engineer": ["python", "scikit-learn", "pytorch", "mlops", "docker", "kubernetes", "sql", "pandas", "numpy", "aws", "feature engineering", "ci/cd"],
        "Data Scientist": ["python", "r", "sql", "pandas", "numpy", "statistics", "data visualization", "tableau", "power bi", "machine learning", "hypothesis testing"],
        "Software Engineer": ["data structures", "algorithms", "system design", "git", "ci/cd", "rest api", "sql", "nosql", "docker", "microservices", "unit testing"],
        "Fullstack Developer": ["react", "typescript", "node.js", "javascript", "html", "css", "tailwind", "sql", "postgresql", "rest api", "git", "express"]
    }

    @classmethod
    def analyze(cls, raw_text: str, parsed_data: Dict[str, Any], target_role: str = "AI Engineer") -> Dict[str, Any]:
        text_lower = raw_text.lower()
        sections = parsed_data.get("sections", {})
        detected_skills = parsed_data.get("detected_skills", [])

        # 1. Section Completeness Score (max 25)
        sec_score = 0
        if sections.get("skills") or len(detected_skills) >= 4:
            sec_score += 6
        if sections.get("experience") or "experience" in text_lower or "intern" in text_lower:
            sec_score += 7
        if sections.get("education") or "degree" in text_lower or "university" in text_lower or "college" in text_lower:
            sec_score += 6
        if sections.get("projects") or "project" in text_lower:
            sec_score += 6

        # 2. Metric & Impact Score (Quantified achievements: %, numbers, metrics) (max 20)
        quantified_matches = re.findall(r'\b\d+(?:\.\d+)?%|\b\d+x\b|\$[\d,]+|\b\d+\s*(?:users|clients|requests|ms|seconds|accuracy|reduction|increase|downloads)\b', text_lower)
        impact_score = min(20, len(quantified_matches) * 4)

        # 3. Target Role Keyword Alignment Score (max 30)
        target_keys = cls.ROLE_KEYWORDS.get(target_role, cls.ROLE_KEYWORDS["AI Engineer"])
        matched_role_keys = [k for k in target_keys if k in text_lower]
        keyword_score = int((len(matched_role_keys) / max(1, len(target_keys))) * 30)

        # 4. Action Verbs & Clarity (max 15)
        action_verbs = ["developed", "architected", "engineered", "built", "implemented", "optimized", "spearheaded", "designed", "trained", "deployed", "scaled"]
        verbs_found = [v for v in action_verbs if v in text_lower]
        verb_score = min(15, len(verbs_found) * 2)

        # 5. Length & Formatting Score (max 10)
        word_count = len(raw_text.split())
        if 250 <= word_count <= 800:
            format_score = 10
        elif 150 <= word_count < 250 or 800 < word_count <= 1200:
            format_score = 7
        else:
            format_score = 5

        # Sub-scores (0-100 scale)
        ats_score = min(98, max(55, int((sec_score / 25) * 35 + (keyword_score / 30) * 45 + (format_score / 10) * 20)))
        skills_score = min(96, max(50, int((len(detected_skills) / 12) * 80 + (len(matched_role_keys) / len(target_keys)) * 20)))
        experience_score = min(95, max(45, int((impact_score / 20) * 60 + (verb_score / 15) * 40)))
        education_score = 92 if sections.get("education") or "degree" in text_lower else 75
        formatting_score = min(96, max(60, format_score * 9 + (8 if len(sections.get("contact", {}).get("links", [])) > 0 else 0)))
        keywords_score = min(98, max(40, int((len(matched_role_keys) / max(1, len(target_keys))) * 100)))

        # Overall composite
        overall_score = int(
            ats_score * 0.30 +
            skills_score * 0.25 +
            experience_score * 0.20 +
            education_score * 0.10 +
            keywords_score * 0.15
        )

        # Missing critical keywords for target role
        missing_critical = [k.title() for k in target_keys if k not in text_lower][:6]

        # Strengths
        strengths = []
        if len(detected_skills) >= 6:
            strengths.append(f"Strong technical skill representation with {len(detected_skills)} identified competencies.")
        if impact_score >= 12:
            strengths.append("Effective use of quantifiable metrics, accuracy numbers, and measurable business/academic outcomes.")
        if len(verbs_found) >= 4:
            strengths.append(f"Strong action-oriented phrasing including verbs such as {', '.join(verbs_found[:3])}.")
        if "github" in text_lower or "linkedin" in text_lower:
            strengths.append("Professional profile visibility with public portfolio/GitHub/LinkedIn links detected.")
        if not strengths:
            strengths.append("Clean baseline structure with essential educational and project sections present.")

        # Weaknesses
        weaknesses = []
        if impact_score < 8:
            weaknesses.append("Project and experience descriptions lack measurable metrics (e.g. latency reduction, accuracy percentages, or scale).")
        if missing_critical:
            weaknesses.append(f"Missing high-demand {target_role} competencies such as {', '.join(missing_critical[:3])}.")
        if len(detected_skills) < 5:
            weaknesses.append("Skills section could be broader; add relevant frameworks, databases, and deployment tools.")
        if word_count < 250:
            weaknesses.append("Resume length is brief. Elaborate on project architectures, design decisions, and tools used.")
        if not weaknesses:
            weaknesses.append("Minor opportunities to deepen cloud deployment and automated CI/CD coverage.")

        # Actionable Suggestions
        suggestions = [
            f"Incorporate targeted keywords for {target_role} roles: {', '.join(missing_critical[:4]) if missing_critical else 'Docker, Kubernetes, CI/CD'}.",
            "Transform responsibility bullets into achievement statements using the Formula: 'Accomplished [X] as measured by [Y] by doing [Z]'.",
            "Ensure GitHub repository links for listed projects have comprehensive READMEs, setup instructions, and live demos.",
            "Group your technical skills into clear subcategories: Languages, Frameworks/Libraries, Cloud/DevOps, and Databases."
        ]

        # Smart bullet rewrites
        bullet_rewrites = [
            {
                "original": "Worked on machine learning project using Python and dataset to predict outcomes.",
                "suggested": f"Engineered an end-to-end ML prediction pipeline in Python with Scikit-learn, achieving 89% cross-validation accuracy and reducing inference time by 28%.",
                "impact_reason": "Replaces passive 'worked on' with active verb 'Engineered', cites specific libraries, and includes quantified metrics."
            },
            {
                "original": "Built a web application for users to view data and search jobs.",
                "suggested": "Architected a full-stack responsive web application with React, TypeScript, and FastAPI, handling 1,000+ mock queries with sub-100ms response times.",
                "impact_reason": "Specifies modern tech stack and measurable performance benchmark."
            }
        ]

        return {
            "overall_score": overall_score,
            "ats_score": ats_score,
            "skills_score": skills_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "formatting_score": formatting_score,
            "keywords_score": keywords_score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "extracted_skills": detected_skills,
            "missing_critical_skills": missing_critical,
            "bullet_rewrites": bullet_rewrites
        }
