"""
BizGen AI - Payment Service
Handles Stripe and Flutterwave payments
"""
import stripe
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import httpx

from app.config import settings


class PaymentService:
    """Service for handling payments via Stripe and Flutterwave"""
    
    def __init__(self):
        # Stripe configuration
        self.stripe_key = settings.STRIPE_SECRET_KEY
        if self.stripe_key:
            stripe.api_key = self.stripe_key
        
        # Flutterwave configuration (for Africa)
        self.flw_secret_key = settings.FLUTTERWAVE_SECRET_KEY
        self.flw_public_key = settings.FLUTTERWAVE_PUBLIC_KEY
        
        # Pricing plans
        self.plans = {
            "FREE": {
                "name": "Gratuit",
                "price": 0,
                "currency": "EUR",
                "max_projects": 1,
                "max_exports": 3,
                "features": ["1 projet/mois", "Exports PNG", "BMC & Lean Canvas"]
            },
            "BASIC": {
                "name": "Basic",
                "price": 7,
                "currency": "EUR",
                "stripe_price_id": settings.STRIPE_BASIC_PRICE_ID,
                "max_projects": 5,
                "max_exports": 20,
                "features": ["5 projets/mois", "Exports PDF", "Business Plan complet", "Sans watermark"]
            },
            "PRO": {
                "name": "Pro",
                "price": 19,
                "currency": "EUR",
                "stripe_price_id": settings.STRIPE_PRO_PRICE_ID,
                "max_projects": -1,  # Unlimited
                "max_exports": -1,
                "features": ["Projets illimités", "Exports PDF/Word", "Templates premium", "Support prioritaire", "API access"]
            }
        }
    
    # ============================================
    # STRIPE METHODS
    # ============================================
    
    async def create_stripe_customer(self, email: str, name: str) -> Optional[str]:
        """Create a Stripe customer"""
        if not self.stripe_key:
            return None
        
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={"source": "bizgen-ai"}
            )
            return customer.id
        except stripe.error.StripeError as e:
            print(f"Stripe error creating customer: {e}")
            return None
    
    async def create_stripe_subscription(
        self,
        customer_id: str,
        plan: str,
        success_url: str,
        cancel_url: str
    ) -> Optional[Dict[str, Any]]:
        """Create a Stripe checkout session for subscription"""
        if not self.stripe_key:
            return None
        
        plan_data = self.plans.get(plan)
        if not plan_data or not plan_data.get("stripe_price_id"):
            return None
        
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": plan_data["stripe_price_id"],
                    "quantity": 1
                }],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={"plan": plan}
            )
            
            return {
                "session_id": session.id,
                "checkout_url": session.url
            }
        except stripe.error.StripeError as e:
            print(f"Stripe error creating subscription: {e}")
            return None
    
    async def cancel_stripe_subscription(self, subscription_id: str) -> bool:
        """Cancel a Stripe subscription"""
        if not self.stripe_key:
            return False
        
        try:
            stripe.Subscription.delete(subscription_id)
            return True
        except stripe.error.StripeError as e:
            print(f"Stripe error canceling subscription: {e}")
            return False
    
    def verify_stripe_webhook(self, payload: bytes, sig_header: str) -> Optional[Dict[str, Any]]:
        """Verify and parse Stripe webhook"""
        if not settings.STRIPE_WEBHOOK_SECRET:
            return None
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except stripe.error.SignatureVerificationError:
            return None
    
    # ============================================
    # FLUTTERWAVE METHODS (for Africa)
    # ============================================
    
    async def create_flutterwave_payment(
        self,
        email: str,
        amount: float,
        plan: str,
        redirect_url: str,
        phone: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a Flutterwave payment link"""
        if not self.flw_secret_key:
            return None
        
        plan_data = self.plans.get(plan)
        if not plan_data:
            return None
        
        # Convert EUR to XAF (approximate rate)
        amount_xaf = int(amount * 655.957)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.flutterwave.com/v3/payments",
                    headers={
                        "Authorization": f"Bearer {self.flw_secret_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "tx_ref": f"bizgen-{plan}-{datetime.now().timestamp()}",
                        "amount": amount_xaf,
                        "currency": "XAF",
                        "redirect_url": redirect_url,
                        "customer": {
                            "email": email,
                            "phonenumber": phone or "",
                        },
                        "customizations": {
                            "title": f"BizGen AI - Plan {plan_data['name']}",
                            "description": f"Abonnement {plan_data['name']} - BizGen AI",
                            "logo": "https://bizgen.ai/logo.png"
                        },
                        "meta": {
                            "plan": plan
                        }
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "payment_url": data["data"]["link"],
                        "tx_ref": data["data"]["tx_ref"]
                    }
                else:
                    print(f"Flutterwave error: {response.text}")
                    return None
                    
            except Exception as e:
                print(f"Flutterwave error: {e}")
                return None
    
    async def verify_flutterwave_payment(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """Verify a Flutterwave payment"""
        if not self.flw_secret_key:
            return None
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify",
                    headers={"Authorization": f"Bearer {self.flw_secret_key}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data["data"]["status"] == "successful":
                        return {
                            "status": "success",
                            "tx_ref": data["data"]["tx_ref"],
                            "amount": data["data"]["amount"],
                            "currency": data["data"]["currency"],
                            "customer_email": data["data"]["customer"]["email"],
                            "plan": data["data"]["meta"].get("plan", "BASIC")
                        }
                return None
                
            except Exception as e:
                print(f"Flutterwave verification error: {e}")
                return None
    
    # ============================================
    # PLAN LIMITS
    # ============================================
    
    def get_plan_limits(self, plan: str) -> Dict[str, Any]:
        """Get limits for a specific plan"""
        plan_data = self.plans.get(plan, self.plans["FREE"])
        return {
            "max_projects": plan_data["max_projects"],
            "max_exports": plan_data["max_exports"],
            "features": plan_data["features"],
            "price": plan_data["price"],
            "currency": plan_data["currency"]
        }
    
    def can_create_project(self, plan: str, current_count: int) -> bool:
        """Check if user can create a new project"""
        limits = self.get_plan_limits(plan)
        if limits["max_projects"] == -1:  # Unlimited
            return True
        return current_count < limits["max_projects"]
    
    def can_export(self, plan: str, current_count: int) -> bool:
        """Check if user can export"""
        limits = self.get_plan_limits(plan)
        if limits["max_exports"] == -1:  # Unlimited
            return True
        return current_count < limits["max_exports"]


# Singleton instance
payment_service = PaymentService()
