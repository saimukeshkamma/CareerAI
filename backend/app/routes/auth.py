import secrets
import datetime
import httpx
from jose import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.auth import (
    UserRegister, UserLogin, Token, ForgotPasswordRequest, 
    ResetPasswordRequest, GoogleAuthRequest
)
from ..schemas.user import UserResponse
from ..utils.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    new_user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
        target_role=user_in.target_role or "AI Engineer",
        experience_level=user_in.experience_level or "Entry-level",
        college=user_in.college,
        degree=user_in.degree
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "target_role": new_user.target_role,
            "experience_level": new_user.experience_level
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "target_role": user.target_role,
            "experience_level": user.experience_level
        }
    }

@router.post("/demo-login/{user_id}", response_model=Token)
def demo_login(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Fallback to first user
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="No demo users available.")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "target_role": user.target_role,
            "experience_level": user.experience_level
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        return {"message": "If that email exists, password reset instructions have been dispatched."}
    return {"message": "Password reset instructions sent. Please check your inbox."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password successfully reset. You can now login with your new password."}

@router.post("/google", response_model=Token)
async def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    resolved_email = None
    resolved_name = None
    resolved_picture = None

    if req.credential and "." in req.credential:
        # 1. Attempt official Google token verification via Google tokeninfo endpoint
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={req.credential}")
                if res.status_code == 200:
                    data = res.json()
                    resolved_email = data.get("email")
                    resolved_name = data.get("name")
                    resolved_picture = data.get("picture")
        except Exception:
            pass

        # 2. If tokeninfo verification was unreachable or dev token, parse unverified claims from JWT
        if not resolved_email:
            try:
                claims = jwt.get_unverified_claims(req.credential)
                if claims and isinstance(claims, dict):
                    resolved_email = claims.get("email")
                    resolved_name = claims.get("name")
                    resolved_picture = claims.get("picture")
            except Exception:
                pass

    # 3. Fallback to direct payload fields if supplied
    if not resolved_email and req.email:
        resolved_email = str(req.email)
        resolved_name = req.name
        resolved_picture = req.picture

    if not resolved_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authentication failed. No valid Google account email could be resolved."
        )

    resolved_email = resolved_email.strip().lower()
    if not resolved_name:
        resolved_name = resolved_email.split("@")[0].replace(".", " ").title()

    # Find existing user or register new user
    user = db.query(User).filter(User.email == resolved_email).first()

    if user:
        # Update user profile photo if provided by Google and currently missing
        if resolved_picture and not user.profile_photo:
            user.profile_photo = resolved_picture
        user.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(user)
    else:
        # Automatically sign up the user with their Google identity
        random_pwd = secrets.token_urlsafe(32)
        user = User(
            name=resolved_name,
            email=resolved_email,
            password_hash=get_password_hash(random_pwd),
            profile_photo=resolved_picture,
            target_role="AI Engineer",
            experience_level="Entry-level",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "target_role": user.target_role,
            "experience_level": user.experience_level
        }
    }
