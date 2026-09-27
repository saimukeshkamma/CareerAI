from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class LearningVideoOut(BaseModel):
    id: int
    topic_id: int
    video_id: str
    title: str
    channel_name: str
    channel_avatar: Optional[str] = None
    thumbnail_url: str
    description: Optional[str] = None
    duration: Optional[str] = None
    difficulty: str = "Intermediate"
    youtube_url: str
    view_count: Optional[str] = None
    teaching_style: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LearningTopicBrief(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    description: str
    difficulty: str
    subtopics: List[str] = []
    icon: Optional[str] = None
    video_count: int = 0
    creators: List[str] = []
    user_status: str = "NOT_STARTED"
    user_progress: int = 0
    is_saved: bool = False

    model_config = ConfigDict(from_attributes=True)

class LearningTopicDetail(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    description: str
    why_learn: Optional[str] = None
    difficulty: str
    subtopics: List[str] = []
    icon: Optional[str] = None
    videos: List[LearningVideoOut] = []
    user_status: str = "NOT_STARTED"
    user_progress: int = 0
    is_saved: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LearningCategoryOut(BaseModel):
    category: str
    topic_count: int
    icon: Optional[str] = None
    description: Optional[str] = None

class UserLearningProgressIn(BaseModel):
    topic_id: int
    video_id: Optional[int] = None
    status: Optional[str] = None  # NOT_STARTED, IN_PROGRESS, COMPLETED
    progress: Optional[int] = None  # 0 to 100
    is_saved: Optional[bool] = None
    notes: Optional[str] = None

class UserLearningProgressOut(BaseModel):
    id: int
    topic_id: int
    topic_name: str
    topic_slug: str
    category: str
    status: str
    progress: int
    is_saved: bool
    last_accessed: datetime

    model_config = ConfigDict(from_attributes=True)

class InterviewWeakTopicOut(BaseModel):
    id: Optional[int] = None
    topic_name: str
    score: int
    performance_level: str  # "Needs Improvement", "Critical Gap", "Fair"
    reason: str
    topic_slug: Optional[str] = None
    topic_id: Optional[int] = None
    recommended_videos: List[LearningVideoOut] = []

class PersonalizedLearningOut(BaseModel):
    source: str  # "interview", "skill_gap", "role_track"
    weak_topics: List[InterviewWeakTopicOut] = []
    strong_topics: List[str] = []
    latest_interview_id: Optional[int] = None
    latest_interview_role: Optional[str] = None
    total_recommendations_count: int = 0
