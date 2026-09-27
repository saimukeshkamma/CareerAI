from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class InterviewCreate(BaseModel):
    role: str
    interview_type: str = "Technical"  # Technical, HR, Behavioral, System Design, Coding
    difficulty: str = "Intermediate"  # Beginner, Intermediate, Advanced
    resume_id: Optional[int] = None

class InterviewAnswerSubmit(BaseModel):
    user_answer: str
    is_audio: bool = False
    audio_duration: float = 0.0

class InterviewAnswerResponse(BaseModel):
    id: int
    question_id: int
    score: int
    feedback: str
    strengths: List[str]
    improvements: List[str]
    model_answer_structure: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InterviewQuestionResponse(BaseModel):
    id: int
    order_index: int
    question_text: str
    category: str
    context_hint: Optional[str] = None
    expected_topics: Optional[List[str]] = []
    answer: Optional[InterviewAnswerResponse] = None

    model_config = ConfigDict(from_attributes=True)

class InterviewDetailResponse(BaseModel):
    id: int
    role: str
    interview_type: str
    difficulty: str
    status: str
    overall_score: Optional[int] = None
    technical_score: Optional[int] = None
    communication_score: Optional[int] = None
    problem_solving_score: Optional[int] = None
    relevance_score: Optional[int] = None
    clarity_score: Optional[int] = None
    feedback_summary: Optional[str] = None
    key_strengths: Optional[List[str]] = []
    key_improvements: Optional[List[str]] = []
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class InterviewSummaryItem(BaseModel):
    id: int
    role: str
    interview_type: str
    difficulty: str
    status: str
    overall_score: Optional[int] = None
    questions_count: int
    answered_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
