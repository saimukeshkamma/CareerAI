import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from ..database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    
    role = Column(String(120), nullable=False)
    interview_type = Column(String(50), default="Technical")  # Technical, HR, Behavioral, System Design, Coding
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    status = Column(String(50), default="in_progress")  # in_progress, completed
    
    overall_score = Column(Integer, nullable=True)
    technical_score = Column(Integer, nullable=True)
    communication_score = Column(Integer, nullable=True)
    problem_solving_score = Column(Integer, nullable=True)
    relevance_score = Column(Integer, nullable=True)
    clarity_score = Column(Integer, nullable=True)
    
    feedback_summary = Column(Text, nullable=True)
    key_strengths = Column(Text, nullable=True)  # JSON string
    key_improvements = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="interviews")
    resume = relationship("Resume", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewQuestion.order_index")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1)
    question_text = Column(Text, nullable=False)
    category = Column(String(100), default="Technical Concept")
    context_hint = Column(Text, nullable=True)
    expected_topics = Column(Text, nullable=True)  # JSON string list

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_answer = Column(Text, nullable=False)
    is_audio = Column(Boolean, default=False)
    audio_duration = Column(Float, default=0.0)
    
    score = Column(Integer, default=75)
    feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)  # JSON string list
    improvements = Column(Text, nullable=True)  # JSON string list
    model_answer_structure = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    question = relationship("InterviewQuestion", back_populates="answer")
