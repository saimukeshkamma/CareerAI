import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models.user import User
from ..models.learning import LearningTopic, LearningVideo, UserLearningProgress, InterviewWeakTopic
from ..models.interview import Interview
from ..schemas.learning import (
    LearningTopicBrief, LearningTopicDetail, LearningCategoryOut,
    UserLearningProgressIn, UserLearningProgressOut,
    PersonalizedLearningOut, InterviewWeakTopicOut
)
from ..services.learning_recommendation import LearningRecommendationService
from ..services.youtube_service import YouTubeService
from ..utils.security import get_current_user

router = APIRouter(prefix="/learning", tags=["YouTube Learning Hub"])

def safe_parse_json(val, default):
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

@router.get("/categories", response_model=List[LearningCategoryOut])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all topic categories with their total topic count.
    """
    CATEGORY_META = [
        {"category": "Programming", "icon": "Code", "description": "Python, Java, C++, JavaScript & Software Engineering Principles"},
        {"category": "Artificial Intelligence", "icon": "Brain", "description": "AI Foundations, Generative AI, LLMs, NLP & Computer Vision"},
        {"category": "Data", "icon": "Database", "description": "SQL Joins, Analytics, Statistics, Pandas & Query Optimization"},
        {"category": "Machine Learning", "icon": "Cpu", "description": "Regression, Ensemble Trees, SVM, Overfitting & Model Tuning"},
        {"category": "Deep Learning", "icon": "Layers", "description": "Neural Networks, Backpropagation, CNN, LSTM & Transformers"},
        {"category": "Interview Preparation", "icon": "Briefcase", "description": "STAR Method, Technical Coding, System Design & Behavioral"},
        {"category": "Cloud & DevOps", "icon": "Cloud", "description": "Docker Containers, Kubernetes, CI/CD & Distributed Systems"}
    ]

    results = []
    for meta in CATEGORY_META:
        count = db.query(LearningTopic).filter(LearningTopic.category == meta["category"]).count()
        results.append({
            "category": meta["category"],
            "topic_count": count,
            "icon": meta["icon"],
            "description": meta["description"]
        })
    return results

@router.get("/topics", response_model=List[LearningTopicBrief])
def list_topics(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    q: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search and filter topics in the learning library with user progress tracking.
    """
    query = db.query(LearningTopic)

    if category and category != "All":
        query = query.filter(LearningTopic.category == category)

    if difficulty and difficulty != "All":
        query = query.filter(LearningTopic.difficulty == difficulty)

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                LearningTopic.name.ilike(search_term),
                LearningTopic.description.ilike(search_term),
                LearningTopic.subtopics.ilike(search_term),
                LearningTopic.category.ilike(search_term)
            )
        )

    topics = query.order_by(LearningTopic.id.asc()).all()

    # User progress map
    progress_records = db.query(UserLearningProgress).filter(
        UserLearningProgress.user_id == current_user.id
    ).all()
    progress_map = {p.topic_id: p for p in progress_records}

    results = []
    for t in topics:
        user_p = progress_map.get(t.id)
        creators = list(set([v.channel_name for v in t.videos])) if t.videos else []
        subtopics = safe_parse_json(t.subtopics, [])

        results.append(LearningTopicBrief(
            id=t.id,
            name=t.name,
            slug=t.slug,
            category=t.category,
            description=t.description,
            difficulty=t.difficulty,
            subtopics=subtopics,
            icon=t.icon,
            video_count=len(t.videos),
            creators=creators[:4],
            user_status=user_p.status if user_p else "NOT_STARTED",
            user_progress=user_p.progress if user_p else 0,
            is_saved=user_p.is_saved if user_p else False
        ))

    return results

@router.get("/topics/{identifier}", response_model=LearningTopicDetail)
def get_topic_detail(
    identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves full topic details including multiple creator videos and AI concept explanation.
    """
    topic = None
    if identifier.isdigit():
        topic = db.query(LearningTopic).filter(LearningTopic.id == int(identifier)).first()
    if not topic:
        topic = db.query(LearningTopic).filter(LearningTopic.slug == identifier.lower()).first()

    if not topic:
        raise HTTPException(status_code=404, detail="Learning topic not found.")

    # User progress
    user_p = db.query(UserLearningProgress).filter(
        UserLearningProgress.user_id == current_user.id,
        UserLearningProgress.topic_id == topic.id
    ).first()

    # Format videos
    formatted_videos = []
    if topic.videos:
        for v in topic.videos:
            formatted_videos.append({
                "id": v.id,
                "topic_id": v.topic_id,
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
        # Fallback to dynamic curated videos if DB had no rows
        raw_vids = YouTubeService.get_videos_for_topic(topic.slug, topic.name)
        for idx, rv in enumerate(raw_vids, start=1):
            formatted_videos.append({
                "id": idx,
                "topic_id": topic.id,
                **rv
            })

    return LearningTopicDetail(
        id=topic.id,
        name=topic.name,
        slug=topic.slug,
        category=topic.category,
        description=topic.description,
        why_learn=topic.why_learn,
        difficulty=topic.difficulty,
        subtopics=safe_parse_json(topic.subtopics, []),
        icon=topic.icon,
        videos=formatted_videos,
        user_status=user_p.status if user_p else "NOT_STARTED",
        user_progress=user_p.progress if user_p else 0,
        is_saved=user_p.is_saved if user_p else False,
        created_at=topic.created_at
    )

@router.get("/recommendations/for-you", response_model=PersonalizedLearningOut)
def get_for_you_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns AI-personalized YouTube learning recommendations derived directly
    from the user's latest mock interview evaluation and resume skill gaps.
    """
    return LearningRecommendationService.get_for_you_recommendations(current_user.id, db)

@router.get("/interviews/{interview_id}/recommendations")
def get_interview_recommendations(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns weak topics and multi-creator video recommendations for a specific interview.
    """
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    return LearningRecommendationService.extract_weak_topics_from_interview(interview, db)

@router.post("/progress")
def update_learning_progress(
    data: UserLearningProgressIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update topic learning status, progress percentage, or saved/watch-later state.
    """
    record = db.query(UserLearningProgress).filter(
        UserLearningProgress.user_id == current_user.id,
        UserLearningProgress.topic_id == data.topic_id
    ).first()

    if not record:
        record = UserLearningProgress(
            user_id=current_user.id,
            topic_id=data.topic_id,
            video_id=data.video_id,
            status=data.status or "IN_PROGRESS",
            progress=data.progress or 25,
            is_saved=data.is_saved if data.is_saved is not None else False,
            notes=data.notes
        )
        db.add(record)
    else:
        if data.status is not None:
            record.status = data.status
        if data.progress is not None:
            record.progress = data.progress
            if data.progress >= 100:
                record.status = "COMPLETED"
            elif data.progress > 0 and record.status == "NOT_STARTED":
                record.status = "IN_PROGRESS"
        if data.is_saved is not None:
            record.is_saved = data.is_saved
        if data.video_id is not None:
            record.video_id = data.video_id
        if data.notes is not None:
            record.notes = data.notes

    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "topic_id": record.topic_id,
        "learning_status": record.status,
        "progress": record.progress,
        "is_saved": record.is_saved
    }

@router.get("/my-learning")
def get_my_learning(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns user's saved topics, in-progress courses, and completed milestones.
    """
    records = db.query(UserLearningProgress).filter(
        UserLearningProgress.user_id == current_user.id
    ).all()

    in_progress = []
    completed = []
    saved = []

    for r in records:
        if not r.topic:
            continue
        item = {
            "id": r.id,
            "topic_id": r.topic.id,
            "topic_name": r.topic.name,
            "topic_slug": r.topic.slug,
            "category": r.topic.category,
            "difficulty": r.topic.difficulty,
            "status": r.status,
            "progress": r.progress,
            "is_saved": r.is_saved,
            "video_count": len(r.topic.videos),
            "last_accessed": r.last_accessed
        }

        if r.is_saved:
            saved.append(item)
        if r.status == "COMPLETED" or r.progress >= 100:
            completed.append(item)
        elif r.status == "IN_PROGRESS" or (r.progress > 0 and r.progress < 100):
            in_progress.append(item)

    return {
        "in_progress": in_progress,
        "completed": completed,
        "saved": saved,
        "total_active_topics": len(in_progress),
        "total_completed_topics": len(completed),
        "total_saved_topics": len(saved)
    }
