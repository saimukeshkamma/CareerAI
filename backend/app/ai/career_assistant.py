from typing import List, Dict, Any

class AICareerAssistant:
    @classmethod
    def generate_response(
        cls,
        message: str,
        user_name: str = "Candidate",
        target_role: str = "AI Engineer",
        resume_score: int = 85,
        detected_skills: List[str] = None,
        missing_skills: List[str] = None
    ) -> Dict[str, Any]:
        msg_lower = message.lower()
        skills_str = ", ".join(detected_skills[:5]) if detected_skills else "Python, Machine Learning, SQL"
        missing_str = ", ".join(missing_skills[:3]) if missing_skills else "Docker, AWS, FastAPI"

        suggestions = []
        actions = []

        if "skill" in msg_lower or "learn" in msg_lower:
            reply = (
                f"Hi {user_name}! For an ambitious **{target_role}** path, you already have strong foundations in **{skills_str}**. "
                f"To boost your market readiness to the top tier, prioritize mastering:\n\n"
                f"1. **{missing_skills[0] if missing_skills else 'Docker & Containerization'}**: Package your model inference pipelines for seamless deployment.\n"
                f"2. **{missing_skills[1] if len(missing_skills) > 1 else 'FastAPI & Async Inference'}**: Build low-latency REST endpoints for real-time model serving.\n"
                f"3. **{missing_skills[2] if len(missing_skills) > 2 else 'Cloud / AWS SageMaker'}**: Gain hands-on experience provisioning GPU instances and hosting models.\n\n"
                f"Would you like me to map out a step-by-step 4-week learning roadmap for any of these?"
            )
            suggestions = [
                "Map out a 4-week Docker roadmap",
                "How can I practice interview questions for FastAPI?",
                "What portfolio projects showcase these skills?"
            ]
            actions = [
                {"label": "View Skill Gap Analyzer", "route": "/skills"},
                {"label": "Browse Matched Jobs", "route": "/jobs"}
            ]

        elif "resume" in msg_lower or "score" in msg_lower or "summary" in msg_lower:
            reply = (
                f"Your active resume currently sits at **{resume_score}/100**! 📈\n\n"
                f"Here is how you can push it past **92+**:\n\n"
                f"• **Quantify Outcomes**: Rather than saying *'Built an ML model'*, state: *'Engineered a Random Forest classifier in Scikit-learn, improving customer churn prediction accuracy by 18% with sub-50ms latency.'*\n"
                f"• **Add High-Impact Keywords**: Include modern tooling like {missing_str} in your project tech stacks.\n"
                f"• **Executive Summary Formula**: *'{target_role} with strong hands-on experience in {skills_str}. Proven track record designing scalable pipelines and delivering high-accuracy models with production rigor.'*"
            )
            suggestions = [
                "Give me 3 bullet rewrites for my projects",
                "How does ATS scan my formatting?",
                "Analyze my resume for Senior vs Junior roles"
            ]
            actions = [
                {"label": "Open Resume Analysis", "route": "/resumes"},
                {"label": "Upload Updated Resume", "route": "/resumes"}
            ]

        elif "interview" in msg_lower or "question" in msg_lower or "prep" in msg_lower:
            reply = (
                f"Preparation is key! Here are 3 high-probability questions recruiters and hiring managers ask for **{target_role}** candidates:\n\n"
                f"1. **Core ML / Architecture**: *'Explain the difference between supervised, unsupervised, and reinforcement learning with production examples.'*\n"
                f"2. **Inference & Engineering**: *'How do you handle memory constraints and latency bottlenecks when serving large models?'*\n"
                f"3. **Rigor & Debugging**: *'Walk me through a time your model suffered from severe overfitting in validation. How did you resolve it?'*\n\n"
                f"Ready to practice? You can test yourself in our AI Interview Coach with real-time scoring and audio feedback!"
            )
            suggestions = [
                "Start a Technical Mock Interview now",
                "What are common behavioral interview pitfalls?",
                "How do I use the STAR method effectively?"
            ]
            actions = [
                {"label": "Start AI Mock Interview", "route": "/interview"},
                {"label": "Review Past Interview Reports", "route": "/interviews/history"}
            ]

        elif "project" in msg_lower or "portfolio" in msg_lower:
            reply = (
                f"To stand out to top tech recruiters in 2026, avoid generic tutorial clones (like basic MNIST or Titanic) and build **end-to-end, productionized applications**:\n\n"
                f"1. **Enterprise RAG Knowledge Engine**: Ingest PDF manuals into ChromaDB/Pinecone using LangChain/LlamaIndex, with hybrid search, streaming responses, and citations.\n"
                f"2. **Real-Time Edge Computer Vision Pipeline**: Deploy a YOLOv8 or segmentation model wrapped in FastAPI with WebSockets streaming and Docker containerization.\n"
                f"3. **Automated MLOps Pipeline**: Train an XGBoost or PyTorch model tracked with MLflow, data-versioned with DVC, and deployed via GitHub Actions CI/CD to AWS/Render."
            )
            suggestions = [
                "Give me a tech stack breakdown for the RAG project",
                "How do I showcase GitHub repos to recruiters?",
                "What skills do hiring managers look for in portfolios?"
            ]
            actions = [
                {"label": "Browse Matching Jobs", "route": "/jobs"},
                {"label": "Check Skill Gaps", "route": "/skills"}
            ]

        else:
            reply = (
                f"Hello {user_name}! I am your **CareerAI Assistant** 🤖.\n\n"
                f"I have direct visibility into your career profile targeting **{target_role}**, your active resume (Score: {resume_score}), "
                f"and identified skill gaps ({missing_str}).\n\n"
                f"How can I assist your career progression today? You can ask me to:\n"
                f"• Improve your resume bullet points with quantifiable metrics\n"
                f"• Analyze specific job fit requirements\n"
                f"• Recommend tailored learning paths for missing skills\n"
                f"• Generate targeted mock interview questions"
            )
            suggestions = [
                "What skills should I learn next?",
                "How can I improve my resume score?",
                "Give me 5 mock interview questions",
                "What projects will get me hired?"
            ]
            actions = [
                {"label": "Go to Dashboard", "route": "/dashboard"},
                {"label": "Start Interview Practice", "route": "/interview"}
            ]

        return {
            "reply": reply,
            "suggestions": suggestions,
            "recommended_actions": actions
        }
