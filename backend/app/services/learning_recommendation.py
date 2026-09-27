import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.learning import LearningTopic, LearningVideo, InterviewWeakTopic
from ..models.interview import Interview, InterviewQuestion, InterviewAnswer
from ..models.resume import Resume, ResumeAnalysis
from ..services.youtube_service import YouTubeService
from ..ai.skill_analyzer import AISkillAnalyzer

class LearningRecommendationService:
    """
    Connects interview evaluation and resume skill gaps to targeted, topic-based
    YouTube learning recommendations with multiple creator choices.
    """

    TOPIC_KEYWORD_MAP = {
        "overfitting": "overfitting-underfitting",
        "underfitting": "overfitting-underfitting",
        "bias": "overfitting-underfitting",
        "variance": "overfitting-underfitting",
        "backpropagation": "backpropagation",
        "gradient": "backpropagation",
        "chain rule": "backpropagation",
        "loss function": "backpropagation",
        "join": "sql-joins",
        "inner join": "sql-joins",
        "left join": "sql-joins",
        "sql": "sql-joins",
        "attention": "transformers-attention",
        "transformer": "transformers-attention",
        "self-attention": "transformers-attention",
        "rag": "transformers-attention",
        "docker": "docker-containerization",
        "container": "docker-containerization",
        "neural": "neural-networks",
        "perceptron": "neural-networks",
        "index": "database-indexing",
        "b-tree": "database-indexing",
        "system design": "system-design",
        "scale": "system-design",
        "caching": "system-design",
        "python": "python-fundamentals",
        "behavioral": "behavioral-interview",
        "star": "behavioral-interview",
        "weakness": "behavioral-interview"
    }

    @classmethod
    def match_topic_slug(cls, text: str) -> Optional[str]:
        lower = text.lower()
        for kw, slug in cls.TOPIC_KEYWORD_MAP.items():
            if kw in lower:
                return slug
        return None

    @classmethod
    def extract_weak_topics_from_interview(cls, interview: Interview, db: Session) -> Dict[str, Any]:
        """
        Extracts specific weak topics from interview questions/answers, saves them
        to the interview_weak_topics table, and attaches multi-creator YouTube recommendations.
        """
        weak_topics = []
        strong_topics = []

        questions = sorted(interview.questions, key=lambda q: q.order_index)

        # Clear any prior weak topics for this interview to prevent duplicates
        db.query(InterviewWeakTopic).filter(InterviewWeakTopic.interview_id == interview.id).delete()

        for q in questions:
            if not q.answer:
                continue

            ans = q.answer
            score = ans.score
            q_text = q.question_text
            category = q.category

            matched_slug = cls.match_topic_slug(q_text) or cls.match_topic_slug(category)

            # Look up topic in DB
            db_topic = None
            if matched_slug:
                db_topic = db.query(LearningTopic).filter(LearningTopic.slug == matched_slug).first()

            # Determine topic display name
            topic_display = db_topic.name if db_topic else category

            if score < 75:
                # Needs improvement
                perf_level = "Needs Improvement" if score >= 50 else "Critical Gap"
                
                # Derive specific actionable reason
                reason = "Review fundamental concepts and structured explanations."
                improvements = []
                try:
                    if ans.improvements:
                        improvements = json.loads(ans.improvements)
                except Exception:
                    improvements = []

                if improvements:
                    reason = improvements[0]
                elif "overfitting" in q_text.lower():
                    reason = "Difficulty explaining bias-variance tradeoff and regularization techniques (L1/L2, Dropout)."
                elif "transformer" in q_text.lower() or "attention" in q_text.lower():
                    reason = "Explanation lacked clarity on Query-Key-Value interactions and scaled dot-product attention."
                elif "backpropagation" in q_text.lower() or "gradient" in q_text.lower():
                    reason = "Missed the role of gradients and weight updates via the chain rule."
                elif "join" in q_text.lower():
                    reason = "Difficulty distinguishing INNER JOIN from LEFT JOIN in relational queries."
                elif "index" in q_text.lower():
                    reason = "Incomplete explanation of B-Tree indexing and write overhead on INSERT/UPDATE."
                elif "docker" in q_text.lower():
                    reason = "Could not articulate multi-stage builds and container isolation benefits."

                # Get multiple creator videos
                video_list = []
                if db_topic and db_topic.videos:
                    for v in db_topic.videos[:4]:
                        video_list.append({
                            "id": v.id,
                            "topic_id": db_topic.id,
                            "video_id": v.video_id,
                            "title": v.title,
                            "channel_name": v.channel_name,
                            "channel_avatar": v.channel_avatar,
                            "thumbnail_url": v.thumbnail_url,
                            "description": v.description,
                            "duration": v.duration,
                            "difficulty": v.difficulty,
                            "youtube_url": v.youtube_url,
                            "view_count": v.view_count,
                            "teaching_style": v.teaching_style
                        })
                else:
                    raw_videos = YouTubeService.get_videos_for_topic(matched_slug or "python-fundamentals", topic_display)
                    for idx, rv in enumerate(raw_videos, start=1):
                        video_list.append({
                            "id": idx,
                            "topic_id": db_topic.id if db_topic else 1,
                            **rv
                        })

                # Persist to database
                weak_record = InterviewWeakTopic(
                    interview_id=interview.id,
                    topic_id=db_topic.id if db_topic else None,
                    topic_name=topic_display,
                    score=score,
                    performance_level=perf_level,
                    reason=reason
                )
                db.add(weak_record)

                weak_topics.append({
                    "id": weak_record.id,
                    "topic_name": topic_display,
                    "score": score,
                    "performance_level": perf_level,
                    "reason": reason,
                    "topic_slug": matched_slug or "python-fundamentals",
                    "topic_id": db_topic.id if db_topic else None,
                    "recommended_videos": video_list
                })
            else:
                # Strong topic
                strong_topics.append(topic_display)

        db.commit()

        # If user answered everything well, suggest high-yield advanced topics
        if not weak_topics and questions:
            adv_slug = "system-design"
            adv_topic = db.query(LearningTopic).filter(LearningTopic.slug == adv_slug).first()
            adv_name = adv_topic.name if adv_topic else "System Design & Scalability"
            vids = YouTubeService.get_videos_for_topic(adv_slug, adv_name)
            weak_topics.append({
                "id": 999,
                "topic_name": adv_name,
                "score": 82,
                "performance_level": "Recommended Advance",
                "reason": "You demonstrated strong fundamentals. Deepen your competitive edge with distributed systems and architectural scaling.",
                "topic_slug": adv_slug,
                "topic_id": adv_topic.id if adv_topic else None,
                "recommended_videos": vids
            })

        return {
            "weak_topics": weak_topics,
            "strong_topics": list(set(strong_topics))[:3]
        }

    @classmethod
    def get_for_you_recommendations(cls, user_id: int, db: Session) -> Dict[str, Any]:
        """
        Builds the unified "For You" AI learning track combining:
        1. Weak topics from latest mock interview
        2. Missing skills from active resume skill gap analysis
        """
        # 1. Latest completed interview
        latest_interview = db.query(Interview).filter(
            Interview.user_id == user_id,
            Interview.status == "completed"
        ).order_by(Interview.created_at.desc()).first()

        weak_topic_items = []
        strong_topics = []
        source = "role_track"
        int_id = None
        int_role = None

        if latest_interview:
            int_id = latest_interview.id
            int_role = latest_interview.role
            source = "interview"

            db_weak = db.query(InterviewWeakTopic).filter(InterviewWeakTopic.interview_id == latest_interview.id).all()
            if db_weak:
                for w in db_weak:
                    slug = w.topic.slug if w.topic else (cls.match_topic_slug(w.topic_name) or "python-fundamentals")
                    vids = []
                    if w.topic and w.topic.videos:
                        for v in w.topic.videos[:4]:
                            vids.append({
                                "id": v.id,
                                "topic_id": w.topic.id,
                                "video_id": v.video_id,
                                "title": v.title,
                                "channel_name": v.channel_name,
                                "channel_avatar": v.channel_avatar,
                                "thumbnail_url": v.thumbnail_url,
                                "description": v.description,
                                "duration": v.duration,
                                "difficulty": v.difficulty,
                                "youtube_url": v.youtube_url,
                                "view_count": v.view_count,
                                "teaching_style": v.teaching_style
                            })
                    else:
                        vids = YouTubeService.get_videos_for_topic(slug, w.topic_name)

                    weak_topic_items.append({
                        "id": w.id,
                        "topic_name": w.topic_name,
                        "score": w.score,
                        "performance_level": w.performance_level,
                        "reason": w.reason,
                        "topic_slug": slug,
                        "topic_id": w.topic_id,
                        "recommended_videos": vids
                    })
            else:
                # Re-extract
                extracted = cls.extract_weak_topics_from_interview(latest_interview, db)
                weak_topic_items = extracted["weak_topics"]
                strong_topics = extracted["strong_topics"]

        # 2. If no interview or few weak topics, pull from resume skill gaps
        if len(weak_topic_items) < 2:
            resume = db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active == True).first()
            user_skills = []
            if resume:
                analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
                if analysis and analysis.extracted_skills:
                    try:
                        user_skills = json.loads(analysis.extracted_skills)
                    except Exception:
                        pass

            gaps = AISkillAnalyzer.get_skill_gaps(user_skills, target_role="AI Engineer")
            for g in gaps[:3]:
                skill_name = g["skill"]
                matched_slug = cls.match_topic_slug(skill_name) or "docker-containerization"
                db_t = db.query(LearningTopic).filter(LearningTopic.slug == matched_slug).first()
                vids = YouTubeService.get_videos_for_topic(matched_slug, skill_name)

                # Avoid duplicates
                if not any(item["topic_name"].lower() == skill_name.lower() for item in weak_topic_items):
                    weak_topic_items.append({
                        "id": None,
                        "topic_name": skill_name,
                        "score": 60,
                        "performance_level": "Missing from Resume",
                        "reason": g.get("why_it_matters", f"Essential prerequisite for target {skill_name} interview questions."),
                        "topic_slug": matched_slug,
                        "topic_id": db_t.id if db_t else None,
                        "recommended_videos": vids
                    })

        return {
            "source": source,
            "weak_topics": weak_topic_items,
            "strong_topics": strong_topics or ["Python Fundamentals", "Core Data Analysis"],
            "latest_interview_id": int_id,
            "latest_interview_role": int_role,
            "total_recommendations_count": len(weak_topic_items)
        }
