"""
BizGen AI - Password Reset Router
Handles forgot password and reset password functionality
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
import secrets
import logging

from app.database import get_db
from app.models.models import User
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
    return pwd_context.hash(password)


def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)


def is_token_valid(user: User) -> bool:
    """Check if user has a valid (non-expired) reset token"""
    if not user.resetToken or not user.resetTokenExpires:
        return False
    return user.resetTokenExpires > datetime.utcnow()


async def send_reset_email(email: str, token: str, user_name: Optional[str] = None) -> None:
    """
    Send password reset email (simulated with logging)
    In production, this would integrate with an email service like SendGrid, 
    AWS SES, or similar.
    """
    reset_url = f"{settings.NEXTAUTH_URL}/reset-password?token={token}"
    
    # Simulated email content
    email_content = f"""
    ========================================
    PASSWORD RESET EMAIL (SIMULATED)
    ========================================
    
    To: {email}
    Subject: Réinitialisation de votre mot de passe - BizGen AI
    
    Bonjour {user_name or 'Utilisateur'},
    
    Vous avez demandé la réinitialisation de votre mot de passe.
    
    Cliquez sur le lien suivant pour réinitialiser votre mot de passe:
    {reset_url}
    
    Ce lien expire dans 1 heure.
    
    Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.
    
    Cordialement,
    L'équipe BizGen AI
    ========================================
    """
    
    # Log the email (in production, actually send the email)
    logger.info(email_content)
    
    # In production, you would use something like:
    # await email_service.send(
    #     to=email,
    #     subject="Réinitialisation de votre mot de passe - BizGen AI",
    #     html_content=render_template("reset_password.html", {
    #         "reset_url": reset_url,
    #         "user_name": user_name,
    #         "expires_in": "1 heure"
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
