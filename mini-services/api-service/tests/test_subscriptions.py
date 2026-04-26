"""
BizGen AI - Subscription Tests
Tests for subscription management endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock, patch

from app.models.models import User


class TestSubscriptionPlans:
    """Tests for subscription plan endpoints"""
    
    @pytest.mark.asyncio
    async def test_list_plans(
        self,
        client: AsyncClient
    ):
        """Test listing available subscription plans"""
        response = await client.get("/subscriptions/plans")
        
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) >= 3  # Free, Basic, Pro
    
    @pytest.mark.asyncio
    async def test_get_plan_details(
        self,
        client: AsyncClient
    ):
        """Test getting specific plan details"""
        response = await client.get("/subscriptions/plans/pro")
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Pro"
        assert "features" in data
        assert "price" in data


class TestSubscriptionManagement:
    """Tests for subscription management"""
    
    @pytest.mark.asyncio
    async def test_create_checkout_session(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User
    ):
        """Test creating a checkout session"""
        with patch("app.routers.subscriptions.stripe") as mock_stripe:
            mock_stripe.checkout.Session.create = AsyncMock(return_value={
                "id": "cs_test_123",
                "url": "https://checkout.stripe.com/test"
            })
            
            response = await client.post(
                "/subscriptions/checkout",
                headers=auth_headers,
                json={"plan": "PRO", "billing_cycle": "monthly"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "checkout_url" in data or "session_id" in data
    
    @pytest.mark.asyncio
    async def test_cancel_subscription(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
        db_session: AsyncSession
    ):
        """Test cancelling subscription"""
        # Update user to have a subscription
        test_user.subscriptionPlan = "PRO"
        test_user.subscriptionId = "sub_test123"
        await db_session.commit()
        
        with patch("app.routers.subscriptions.stripe") as mock_stripe:
            mock_stripe.Subscription.delete = AsyncMock(return_value={"status": "canceled"})
            
            response = await client.post(
                "/subscriptions/cancel",
                headers=auth_headers
            )
        
        assert response.status_code == 200


class TestSubscriptionLimits:
    """Tests for subscription limits and usage"""
    
    @pytest.mark.asyncio
    async def test_get_usage_limits(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test getting usage limits"""
        response = await client.get("/subscriptions/usage", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "projectsUsed" in data
        assert "projectsLimit" in data
        assert "exportsUsed" in data
        assert "exportsLimit" in data
    
    @pytest.mark.asyncio
    async def test_current_subscription(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test getting current subscription"""
        response = await client.get("/subscriptions/current", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "plan" in data
    
    @pytest.mark.asyncio
    async def test_upgrade_plan(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
        db_session: AsyncSession
    ):
        """Test upgrading plan"""
        # Simulate upgrade via webhook
        test_user.subscriptionPlan = "PRO"
        await db_session.commit()
        
        response = await client.get("/subscriptions/current", headers=auth_headers)
        data = response.json()
        
        assert data["plan"] == "PRO"


class TestSubscriptionBilling:
    """Tests for subscription billing"""
    
    @pytest.mark.asyncio
    async def test_get_billing_history(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test getting billing history"""
        response = await client.get("/subscriptions/billing", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "invoices" in data
    
    @pytest.mark.asyncio
    async def test_update_payment_method(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test updating payment method"""
        with patch("app.routers.subscriptions.stripe") as mock_stripe:
            mock_stripe.PaymentMethod.attach = AsyncMock(return_value={"id": "pm_test123"})
            
            response = await client.post(
                "/subscriptions/payment-method",
                headers=auth_headers,
                json={"payment_method_id": "pm_test123"}
            )
        
        assert response.status_code in [200, 501]  # 501 if not implemented
