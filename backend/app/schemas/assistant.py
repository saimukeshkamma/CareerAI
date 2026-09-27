from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    context_type: Optional[str] = "general"  # resume, interview, jobs, general

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    recommended_actions: List[Dict[str, str]] = []

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
