"""
BizGen AI - Password Reset Router
Handles forgot password and reset password functionality
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
import secrets
import logging

from app.database import get_db
from app.models.models import User
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


# ============================================
# SCHEMAS
# ============================================

class ForgotPasswordRequest(BaseModel):
    """Request schema for forgot password"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request schema for reset password"""
    token: str = Field(..., min_length=32, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=100)


class ForgotPasswordResponse(BaseModel):
    """Response schema for forgot password"""
    success: bool = True
    message: str = "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."


class ResetPasswordResponse(BaseModel):
    """Response schema for reset password"""
    success: bool = True
    message: str = "Mot de passe réinitialisé avec succès."


# ============================================
# HELPERS
# ============================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password[:72].encode('utf-8'), salt).decode('utf-8')


def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)


def is_token_valid(user: User) -> bool:
    """Check if user has a valid (non-expired) reset token"""
    if not user.resetToken or not user.resetTokenExpires:
        return False
    return user.resetTokenExpires > datetime.utcnow()


async def send_reset_email(email: str, token: str, user_name: Optional[str] = None) -> None:
    """Send password reset email with SMTP fallback to secure logging"""
    reset_url = f"{settings.NEXTAUTH_URL}/reset-password?token={token}"
    
    from app.services.notification_service import notification_service
    sent = await notification_service.send_password_reset_email(
        to_email=email,
        reset_url=reset_url,
        user_name=user_name
    )
    
    if not sent:
        logger.info(f"[PASSWORD RESET] Token généré pour {email}. Lien de réinitialisation: {reset_url}")
    #     })
    # )


# ============================================
# ENDPOINTS
# ============================================

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request a password reset link.
    
    This endpoint always returns success to prevent email enumeration attacks.
    If an account exists with the provided email, a reset link will be sent.
    """
    
    # Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if user:
        # Generate new reset token
        reset_token = generate_reset_token()
        token_expires = datetime.utcnow() + timedelta(hours=1)
        
        # Update user with reset token
        user.resetToken = reset_token
        user.resetTokenExpires = token_expires
        
        await db.commit()
        
        # Send reset email (simulated)
        await send_reset_email(
            email=user.email,
            token=reset_token,
            user_name=user.name
        )
        
        logger.info(f"Password reset requested for email: {request.email}")
    else:
        # Log that email was not found (but don't reveal to user)
        logger.info(f"Password reset requested for non-existent email: {request.email}")
    
    # Always return the same response to prevent email enumeration
    return ForgotPasswordResponse()


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using a valid token.
    
    The token must be valid and not expired (1 hour lifetime).
    After successful reset, the token is cleared.
    """
    
    # Find user by reset token
    result = await db.execute(
        select(User).where(User.resetToken == request.token)
    )
    user = result.scalar_one_or_none()
    
    # Validate user and token
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )
    
    if not is_token_valid(user):
        # Clear expired token
        user.resetToken = None
        user.resetTokenExpires = None
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )
    
    # Validate user has an email (should always be true)
    if not user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compte utilisateur invalide"
        )
    
    # Update password
    user.passwordHash = hash_password(request.new_password)
    
    # Clear reset token
    user.resetToken = None
    user.resetTokenExpires = None
    
    await db.commit()
    
    logger.info(f"Password reset successful for user: {user.email}")
    
    return ResetPasswordResponse()


@router.post("/validate-reset-token")
async def validate_reset_token(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Validate if a reset token is valid and not expired.
    
    Useful for frontend to check token validity before showing the reset form.
    """
    
    result = await db.execute(
        select(User).where(User.resetToken == token)
    )
    user = result.scalar_one_or_none()
    
    if not user or not is_token_valid(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )
    
    return {
        "valid": True,
        "email": user.email,
        "expires_at": user.resetTokenExpires.isoformat() if user.resetTokenExpires else None
    }
