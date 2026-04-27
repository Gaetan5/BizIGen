"""
BizGen AI - Webhooks Router
Handles payment callbacks from Stripe and Flutterwave.
Ensures subscription status is synchronized with real payments.
"""
from fastapi import APIRouter, Request, HTTPException, status, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import logging
from typing import Optional

from app.database import get_db
from app.models.models import User, Subscription, AuditLog
from app.services.payment_service import payment_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhooks for subscription lifecycle.
    """
    if not stripe_signature:
        logger.warning("Stripe webhook received without signature")
        raise HTTPException(status_code=400, detail="Missing signature")

    payload = await request.body()
    event = payment_service.verify_stripe_webhook(payload, stripe_signature)

    if not event:
        logger.error("Stripe webhook signature verification failed")
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    logger.info(f"Processing Stripe webhook: {event_type}")

    if event_type == "checkout.session.completed":
        # New subscription created via Checkout
        user_id = data_object.get("metadata", {}).get("user_id")
        customer_id = data_object.get("customer")
        stripe_sub_id = data_object.get("subscription")
        
        if user_id:
            await _update_subscription_status(db, user_id, customer_id, stripe_sub_id, "ACTIVE")

    elif event_type in ["customer.subscription.updated", "customer.subscription.deleted"]:
        # Subscription changed or cancelled
        stripe_sub_id = data_object.get("id")
        stripe_status = data_object.get("status")
        
        # Map stripe status to our status
        internal_status = "ACTIVE" if stripe_status == "active" else "INACTIVE"
        if stripe_status == "canceled":
            internal_status = "CANCELED"
            
        await _update_subscription_by_stripe_id(db, stripe_sub_id, internal_status)

    return {"status": "success"}

@router.post("/flutterwave")
async def flutterwave_webhook(
    request: Request,
    verif_hash: str = Header(None, alias="verif-hash"),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Flutterwave webhooks for XAF payments.
    """
    # Note: Flutterwave verification usually involves checking the hash 
    # and then calling the verification API.
    payload = await request.json()
    
    # Simple validation for MVP - in production, use a more robust check
    if settings.FLUTTERWAVE_SECRET_HASH and verif_hash != settings.FLUTTERWAVE_SECRET_HASH:
        logger.warning("Flutterwave webhook received with invalid hash")
        # return 200 to avoid Flutterwave retrying indefinitely if it's just a config mismatch
        return {"status": "ignored"}

    event = payload.get("event")
    data = payload.get("data", {})

    logger.info(f"Processing Flutterwave webhook: {event}")

    if event == "charge.completed" and data.get("status") == "successful":
        tx_ref = data.get("tx_ref")
        # tx_ref usually contains bizgen_txn_{user_id}
        if tx_ref and tx_ref.startswith("bizgen_"):
            parts = tx_ref.split("_")
            if len(parts) >= 3:
                user_id = parts[2]
                await _update_subscription_status(db, user_id, None, None, "ACTIVE", "BASIC")

    return {"status": "success"}

async def _update_subscription_status(
    db: AsyncSession, 
    user_id: str, 
    customer_id: Optional[str], 
    sub_id: Optional[str], 
    status: str,
    plan: str = "BASIC"
):
    """Helper to update user subscription in DB"""
    result = await db.execute(select(Subscription).where(Subscription.userId == user_id))
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        subscription = Subscription(userId=user_id)
        db.add(subscription)
    
    subscription.status = status
    subscription.plan = plan
    if customer_id:
        subscription.stripeCustomerId = customer_id
    if sub_id:
        subscription.stripeSubId = sub_id
    
    await db.flush()
    logger.info(f"Subscription updated for user {user_id}: {status}")

async def _update_subscription_by_stripe_id(db: AsyncSession, stripe_sub_id: str, status: str):
    """Helper to update subscription by Stripe ID"""
    result = await db.execute(select(Subscription).where(Subscription.stripeSubId == stripe_sub_id))
    subscription = result.scalar_one_or_none()
    
    if subscription:
        subscription.status = status
        await db.flush()
        logger.info(f"Subscription {stripe_sub_id} updated to {status}")

# Add Depends to the imports if not already there
from fastapi import Depends
