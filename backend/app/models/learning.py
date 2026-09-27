import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from ..database import Base

class LearningTopic(Base):
    __tablename__ = "learning_topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, unique=True, index=True)
    slug = Column(String(140), nullable=False, unique=True, index=True)
    category = Column(String(80), nullable=False, index=True)  # Programming, Artificial Intelligence, Data, Machine Learning, Deep Learning, Interview Preparation, Cloud & DevOps
    description = Column(Text, nullable=False)
    why_learn = Column(Text, nullable=True)
    difficulty = Column(String(40), default="Intermediate")  # Beginner, Intermediate, Advanced
    subtopics = Column(Text, nullable=True)  # JSON string list of subtopic strings
    icon = Column(String(40), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    videos = relationship("LearningVideo", back_populates="topic", cascade="all, delete-orphan", order_by="LearningVideo.id")
    progress_records = relationship("UserLearningProgress", back_populates="topic", cascade="all, delete-orphan")
    weak_topic_records = relationship("InterviewWeakTopic", back_populates="topic")

class LearningVideo(Base):
    __tablename__ = "learning_videos"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("learning_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(String(64), nullable=False)  # YouTube 11-char ID
    title = Column(String(255), nullable=False)
    channel_name = Column(String(120), nullable=False, index=True)  # YouTuber / Creator Name
    channel_avatar = Column(String(255), nullable=True)
    thumbnail_url = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(40), nullable=True)  # e.g. "14:26", "45:00"
    difficulty = Column(String(40), default="Intermediate")  # Beginner, Intermediate, Advanced
    youtube_url = Column(String(255), nullable=False)
    view_count = Column(String(40), nullable=True)
    teaching_style = Column(String(100), nullable=True)  # Visual & Intuitive, From Scratch Code, Step-by-Step, Comprehensive
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    topic = relationship("LearningTopic", back_populates="videos")
    progress_records = relationship("UserLearningProgress", back_populates="video", cascade="all, delete-orphan")

class UserLearningProgress(Base):
    __tablename__ = "user_learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("learning_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(Integer, ForeignKey("learning_videos.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(String(40), default="NOT_STARTED")  # NOT_STARTED, IN_PROGRESS, COMPLETED
    progress = Column(Integer, default=0)  # 0 to 100 percentage
    is_saved = Column(Boolean, default=False)  # Saved / Watch Later / My Learning
    notes = Column(Text, nullable=True)
    last_accessed = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User")
    topic = relationship("LearningTopic", back_populates="progress_records")
    video = relationship("LearningVideo", back_populates="progress_records")

class InterviewWeakTopic(Base):
    __tablename__ = "interview_weak_topics"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("learning_topics.id", ondelete="SET NULL"), nullable=True, index=True)
    
    topic_name = Column(String(120), nullable=False)
    score = Column(Integer, nullable=False)  # Score achieved (e.g. 45)
    performance_level = Column(String(50), default="Needs Improvement")  # Needs Improvement, Fair, Critical Gap
    reason = Column(Text, nullable=False)  # Specific explanation why improvement is required
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    interview = relationship("Interview", back_populates="weak_topics")
    topic = relationship("LearningTopic", back_populates="weak_topic_records")
