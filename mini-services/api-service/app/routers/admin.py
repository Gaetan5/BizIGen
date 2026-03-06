"""
BizGen AI - Admin Router
Handles admin dashboard operations
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.database import get_db
from app.models.models import User, Project, Subscription, GeneratedDocument, Export
from app.routers.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============================================
# SCHEMAS
# ============================================

class AdminStats(BaseModel):
    totalUsers: int
    activeUsers: int
    newUsersThisMonth: int
    totalProjects: int
    totalDocuments: int
    totalExports: int
    revenue: dict
    planDistribution: dict


class UserAdmin(BaseModel):
    id: str
    email: str
    name: Optional[str]
    role: str
    plan: str
    projectsCount: int
    createdAt: str
    lastActive: Optional[str]


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    plan: Optional[str] = None


# ============================================
# ADMIN CHECK
# ============================================

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ============================================
# STATS ENDPOINTS
# ============================================

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics"""
    
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    # Total users
    result = await db.execute(select(func.count(User.id)))
    total_users = result.scalar() or 0
    
    # Active users (last 30 days)
    result = await db.execute(
        select(func.count(User.id)).where(User.updatedAt >= now - timedelta(days=30))
    )
    active_users = result.scalar() or 0
    
    # New users this month
    result = await db.execute(
        select(func.count(User.id)).where(User.createdAt >= month_start)
    )
    new_users = result.scalar() or 0
    
    # Total projects
    result = await db.execute(select(func.count(Project.id)))
    total_projects = result.scalar() or 0
    
    # Total documents generated
    result = await db.execute(select(func.count(GeneratedDocument.id)))
    total_docs = result.scalar() or 0
    
    # Total exports
    result = await db.execute(select(func.count(Export.id)))
    total_exports = result.scalar() or 0
    
    # Plan distribution
    result = await db.execute(
        select(Subscription.plan, func.count(Subscription.id))
        .group_by(Subscription.plan)
    )
    plan_dist = dict(result.fetchall())
    
    # Revenue estimation (Basic: 7€, Pro: 19€)
    basic_count = plan_dist.get("BASIC", 0)
    pro_count = plan_dist.get("PRO", 0)
    monthly_revenue = (basic_count * 7) + (pro_count * 19)
    
    return AdminStats(
        totalUsers=total_users,
        activeUsers=active_users,
        newUsersThisMonth=new_users,
        totalProjects=total_projects,
        totalDocuments=total_docs,
        totalExports=total_exports,
        revenue={
            "monthly": monthly_revenue,
            "currency": "EUR"
        },
        planDistribution={
            "FREE": plan_dist.get("FREE", 0),
            "BASIC": basic_count,
            "PRO": pro_count
        }
    )


# ============================================
# USER MANAGEMENT
# ============================================

@router.get("/users", response_model=List[UserAdmin])
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    plan: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all users with pagination"""
    
    query = select(User)
    
    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) |
            (User.name.ilike(f"%{search}%"))
        )
    
    if plan:
        query = query.join(Subscription).where(Subscription.plan == plan)
    
    query = query.order_by(User.createdAt.desc())
    query = query.offset((page - 1) * limit).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Get additional data for each user
    user_list = []
    for user in users:
        # Get subscription
        result = await db.execute(
            select(Subscription).where(Subscription.userId == user.id)
        )
        sub = result.scalar_one_or_none()
        
        # Get project count
        result = await db.execute(
            select(func.count(Project.id)).where(Project.userId == user.id)
        )
        project_count = result.scalar() or 0
        
        user_list.append(UserAdmin(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            plan=sub.plan if sub else "FREE",
            projectsCount=project_count,
            createdAt=user.createdAt.isoformat() if user.createdAt else None,
            lastActive=user.updatedAt.isoformat() if user.updatedAt else None
        ))
    
    return user_list


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    data: UserUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update a user (admin only)"""
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.name:
        user.name = data.name
    
    if data.role:
        user.role = data.role
    
    if data.plan:
        result = await db.execute(
            select(Subscription).where(Subscription.userId == user_id)
        )
        sub = result.scalar_one_or_none()
        
        if not sub:
            sub = Subscription(userId=user_id, plan=data.plan, status="ACTIVE")
            db.add(sub)
        else:
            sub.plan = data.plan
            if data.plan != "FREE":
                sub.status = "ACTIVE"
    
    return {"success": True, "message": "User updated"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a user (admin only)"""
    
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    
    return {"success": True, "message": "User deleted"}


# ============================================
# PROJECTS MANAGEMENT
# ============================================

@router.get("/projects")
async def list_all_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all projects (admin only)"""
    
    query = select(Project)
    
    if status:
        query = query.where(Project.status == status)
    
    query = query.order_by(Project.createdAt.desc())
    query = query.offset((page - 1) * limit).limit(limit)
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "sector": p.sector,
            "status": p.status,
            "userId": p.userId,
            "createdAt": p.createdAt.isoformat() if p.createdAt else None
        }
        for p in projects
    ]


# ============================================
# SUBSCRIPTIONS MANAGEMENT
# ============================================

@router.get("/subscriptions")
async def list_subscriptions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all subscriptions (admin only)"""
    
    query = select(Subscription).order_by(Subscription.createdAt.desc())
    query = query.offset((page - 1) * limit).limit(limit)
    
    result = await db.execute(query)
    subs = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "userId": s.userId,
            "plan": s.plan,
            "status": s.status,
            "projectsUsed": s.projectsUsed,
            "exportsUsed": s.exportsUsed,
            "createdAt": s.createdAt.isoformat() if s.createdAt else None
        }
        for s in subs
    ]
