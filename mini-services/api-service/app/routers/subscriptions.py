"""
BizGen AI - Subscriptions Router
Handles subscription management and payments
"""
from fastapi import APIRouter, HTTPException, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import stripe
import httpx

from app.database import get_db
from app.models.models import User, Subscription
from app.routers.auth import get_current_user
from app.config import settings
from app.services.payment_service import payment_service

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ============================================
# SCHEMAS
# ============================================

class CheckoutRequest(BaseModel):
    plan: str  # basic, pro
    currency: str = "eur"  # eur, xaf
    successUrl: str
    cancelUrl: Optional[str] = None


class FlutterwaveRequest(BaseModel):
    plan: str  # basic, pro
    currency: str = "xaf"
    redirectUrl: str
    phone: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: str
    userId: str
    status: str
    plan: str
    currentPeriodStart: Optional[str] = None
    currentPeriodEnd: Optional[str] = None
    projectsUsed: int
    exportsUsed: int


# ============================================
# PRICING CONFIGURATION
# ============================================

PRICING = {
    "basic": {
        "eur": {"amount": 700, "stripe_price_id": settings.STRIPE_BASIC_PRICE_ID},
        "xaf": {"amount": 450000, "description": "4 500 XAF/mois"}
    },
    "pro": {
        "eur": {"amount": 1900, "stripe_price_id": settings.STRIPE_PRO_PRICE_ID},
        "xaf": {"amount": 1250000, "description": "12 500 XAF/mois"}
    }
}


# ============================================
# STRIPE ENDPOINTS
# ============================================

@router.post("/checkout")
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a Stripe checkout session"""
    
    if request.currency == "xaf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use Flutterwave for XAF payments"
        )
    
    plan_pricing = PRICING.get(request.plan)
    if not plan_pricing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan"
        )
    
    # Get or create Stripe customer
    result = await db.execute(
        select(Subscription).where(Subscription.userId == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        subscription = Subscription(userId=current_user.id, plan="FREE", status="INACTIVE")
        db.add(subscription)
        await db.flush()
    
    stripe_customer_id = subscription.stripeCustomerId
    
    if not stripe_customer_id:
        # Create Stripe customer
        customer = await payment_service.create_stripe_customer(
            email=current_user.email,
            name=current_user.name or current_user.email
        )
        if customer:
            stripe_customer_id = customer
            subscription.stripeCustomerId = stripe_customer_id
            await db.flush()
    
    # Create checkout session
    result = await payment_service.create_stripe_subscription(
        customer_id=stripe_customer_id,
        plan=request.plan.upper(),
        success_url=request.successUrl,
        cancel_url=request.cancelUrl or request.successUrl.replace("success", "cancel")
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )
    
    return {
        "success": True,
        "checkoutUrl": result["checkout_url"],
        "sessionId": result["session_id"]
    }


# ============================================
# FLUTTERWAVE ENDPOINTS
# ============================================

@router.post("/flutterwave")
async def create_flutterwave_payment(
    request: FlutterwaveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a Flutterwave payment for XAF"""
    
    plan_pricing = PRICING.get(request.plan)
    if not plan_pricing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan"
        )
    
    amount = plan_pricing["xaf"]["amount"]
    
    result = await payment_service.create_flutterwave_payment(
        email=current_user.email,
        amount=amount / 100,  # Flutterwave expects amount in major currency
        plan=request.plan.upper(),
        redirect_url=request.redirectUrl,
        phone=request.phone
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment"
        )
    
    return {
        "success": True,
        "paymentUrl": result["payment_url"],
        "txRef": result["tx_ref"]
    }


@router.post("/flutterwave/verify/{transaction_id}")
async def verify_flutterwave_payment(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify and complete Flutterwave payment"""
    
    result = await payment_service.verify_flutterwave_payment(transaction_id)
    
    if not result or result.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed"
        )
    
    # Update subscription
    plan = result.get("plan", "BASIC")
    
    result = await db.execute(
        select(Subscription).where(Subscription.userId == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        subscription = Subscription(userId=current_user.id)
        db.add(subscription)
    
    subscription.plan = plan
    subscription.status = "ACTIVE"
    subscription.currentPeriodStart = datetime.utcnow()
    subscription.currentPeriodEnd = datetime.utcnow() + timedelta(days=30)
    
    await db.flush()
    
    return {
        "success": True,
        "plan": plan,
        "message": "Subscription activated successfully"
    }


# ============================================
# SUBSCRIPTION MANAGEMENT
# ============================================

@router.get("/status", response_model=SubscriptionResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's subscription status"""
    
    result = await db.execute(
        select(Subscription).where(Subscription.userId == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        return SubscriptionResponse(
            id="",
            userId=current_user.id,
            status="INACTIVE",
            plan="FREE",
            projectsUsed=0,
            exportsUsed=0
        )
    
    return SubscriptionResponse(
        id=subscription.id,
        userId=subscription.userId,
        status=subscription.status,
        plan=subscription.plan,
        currentPeriodStart=subscription.currentPeriodStart.isoformat() if subscription.currentPeriodStart else None,
        currentPeriodEnd=subscription.currentPeriodEnd.isoformat() if subscription.currentPeriodEnd else None,
        projectsUsed=subscription.projectsUsed,
        exportsUsed=subscription.exportsUsed
    )


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel subscription"""
    
    result = await db.execute(
        select(Subscription).where(Subscription.userId == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or subscription.plan == "FREE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription to cancel"
        )
    
    # Cancel in Stripe if applicable
    if subscription.stripeSubId:
        await payment_service.cancel_stripe_subscription(subscription.stripeSubId)
    
    subscription.status = "CANCELED"
    subscription.currentPeriodEnd = datetime.utcnow()
    
    await db.flush()
    
    return {
        "success": True,
        "message": "Subscription canceled. You will retain access until the end of your billing period."
    }


@router.get("/limits")
async def get_plan_limits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get usage limits for current plan"""
    
    result = await db.execute(
        select(Subscription).where(Subscription.userId == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    plan = subscription.plan if subscription else "FREE"
    
    limits = payment_service.get_plan_limits(plan)
    
    return {
        "plan": plan,
        "limits": limits,
        "usage": {
            "projectsUsed": subscription.projectsUsed if subscription else 0,
            "exportsUsed": subscription.exportsUsed if subscription else 0
        }
    }
