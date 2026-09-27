from typing import Optional
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    target_role: Optional[str] = "AI Engineer"
    experience_level: Optional[str] = "Entry-level"
    college: Optional[str] = None
    degree: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None  # Google JWT ID token from Google Identity Services
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
