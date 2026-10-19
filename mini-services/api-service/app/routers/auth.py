"""
BizGen AI - Authentication Router
Handles user registration, login, and JWT tokens
"""
from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.models import User, Subscription
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


# ============================================
# SCHEMAS
# ============================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    role: str
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    success: bool = True
    token: Optional[str] = None
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

    def __init__(self, **data):
        if "access_token" in data and "token" not in data:
            data["token"] = data["access_token"]
        elif "token" in data and "access_token" not in data:
            data["access_token"] = data["token"]
        super().__init__(**data)


from sqlalchemy import select

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    try:
        return bcrypt.checkpw(plain_password[:72].encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password[:72].encode('utf-8'), salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    # 1. Check for External API Key (Third-party integrations)
    api_key = request.headers.get("X-API-Key")
    if api_key and api_key.startswith("bg_"):
        import hashlib
        from app.models.models import ApiKey
        
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        result = await db.execute(
            select(ApiKey).where(ApiKey.keyHash == key_hash)
        )
        key_record = result.scalar_one_or_none()
        
        if key_record:
            # Update last used timestamp
            key_record.lastUsedAt = datetime.utcnow()
            await db.flush()
            
            # Find associated user
            result = await db.execute(select(User).where(User.id == key_record.userId))
            user = result.scalar_one_or_none()
            if user:
                return user

    # 2. Check for Internal API Key (Next.js service-to-service)
    internal_key = request.headers.get("X-Internal-API-Key")
    if internal_key and settings.INTERNAL_API_KEY:
        import secrets
        if secrets.compare_digest(internal_key, settings.INTERNAL_API_KEY):
            # For internal calls, we expect userId in headers
            user_id = request.headers.get("X-User-Id")
            if user_id:
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if user:
                    return user

    # 3. Regular JWT Authentication
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
        
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    return user


# ============================================
# ENDPOINTS
# ============================================

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too weak. Must be at least 8 characters long."
        )
    
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        passwordHash=hashed_password,
        role="USER"
    )
    db.add(user)
    await db.flush()
    
    # Create free subscription
    subscription = Subscription(
        userId=user.id,
        status="INACTIVE",
        plan="FREE"
    )
    db.add(subscription)
    await db.commit()
    await db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return TokenResponse(
        success=True,
        token=access_token,
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user and return JWT token"""
    
    # Find user
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.passwordHash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(credentials.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return TokenResponse(
        success=True,
        token=access_token,
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile or password"""
    if update_data.name is not None:
        current_user.name = update_data.name

    if update_data.newPassword:
        if not update_data.currentPassword or not verify_password(update_data.currentPassword, current_user.passwordHash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        if len(update_data.newPassword) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long"
            )
        current_user.passwordHash = hash_password(update_data.newPassword)

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role
    )


@router.delete("/me")
async def delete_current_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete current user account"""
    await db.delete(current_user)
    await db.commit()
    return {"success": True, "message": "User deleted successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    access_token = create_access_token(
        data={"sub": current_user.id, "email": current_user.email}
    )
    
    return TokenResponse(
        success=True,
        token=access_token,
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=current_user.id,
            email=current_user.email,
            name=current_user.name,
            role=current_user.role
        )
    )
