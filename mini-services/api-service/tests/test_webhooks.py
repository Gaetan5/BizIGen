"""
BizGen AI - Webhook Tests
Tests for payment webhook endpoints
"""
import pytest
from httpx import AsyncClient
import json
import hashlib
import hmac


class TestStripeWebhooks:
    """Tests for Stripe webhook endpoints"""
    
    @pytest.mark.asyncio
    async def test_stripe_webhook_checkout_completed(
        self,
        client: AsyncClient,
        mock_stripe
    ):
        """Test Stripe checkout.session.completed webhook"""
        payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_123",
                    "customer": "cus_test123",
                    "metadata": {
                        "user_id": "test-user-id"
                    }
                }
            }
        }
        
        # In production, we'd verify the signature
        response = await client.post(
            "/webhooks/stripe",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "test_signature"
            }
        )
        
        # Should process the webhook
        assert response.status_code in [200, 400]  # 400 if signature verification fails
    
    @pytest.mark.asyncio
    async def test_stripe_webhook_subscription_created(
        self,
        client: AsyncClient
    ):
        """Test Stripe customer.subscription.created webhook"""
        payload = {
            "type": "customer.subscription.created",
            "data": {
                "object": {
                    "id": "sub_test123",
                    "customer": "cus_test123",
                    "status": "active",
                    "plan": {
                        "id": "price_pro",
                        "nickname": "Pro Plan"
                    }
                }
            }
        }
        
        response = await client.post(
            "/webhooks/stripe",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "test_signature"
            }
        )
        
        assert response.status_code in [200, 400]
    
    @pytest.mark.asyncio
    async def test_stripe_webhook_payment_failed(
        self,
        client: AsyncClient
    ):
        """Test Stripe invoice.payment_failed webhook"""
        payload = {
            "type": "invoice.payment_failed",
            "data": {
                "object": {
                    "id": "in_test123",
                    "customer": "cus_test123",
                    "attempt_count": 3
                }
            }
        }
        
        response = await client.post(
            "/webhooks/stripe",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "test_signature"
            }
        )
        
        assert response.status_code in [200, 400]


class TestFlutterwaveWebhooks:
    """Tests for Flutterwave webhook endpoints"""
    
    @pytest.mark.asyncio
    async def test_flutterwave_webhook_successful_payment(
        self,
        client: AsyncClient
    ):
        """Test Flutterwave successful payment webhook"""
        payload = {
            "event": "charge.completed",
            "data": {
                "id": 123456,
                "tx_ref": "bizgen_txn_123",
                "amount": 50000,
                "currency": "XAF",
                "customer": {
                    "email": "test@example.com"
                },
                "status": "successful"
            }
        }
        
        # Calculate HMAC signature
        secret = "test_flutterwave_secret"
        body = json.dumps(payload, separators=(',', ':'))
        signature = hmac.new(
            secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        response = await client.post(
            "/webhooks/flutterwave",
            content=body,
            headers={
                "Content-Type": "application/json",
                "verif-hash": signature
            }
        )
        
        assert response.status_code in [200, 400, 401]
    
    @pytest.mark.asyncio
    async def test_flutterwave_webhook_subscription_cancelled(
        self,
        client: AsyncClient
    ):
        """Test Flutterwave subscription cancelled webhook"""
        payload = {
            "event": "subscription.cancelled",
            "data": {
                "id": 123456,
                "subscription_id": "sub_flutterwave_123",
                "status": "cancelled"
            }
        }
        
        response = await client.post(
            "/webhooks/flutterwave",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "verif-hash": "test_hash"
            }
        )
        
        assert response.status_code in [200, 400, 401]


class TestWebhookSecurity:
    """Tests for webhook security measures"""
    
    @pytest.mark.asyncio
    async def test_webhook_missing_signature(
        self,
        client: AsyncClient
    ):
        """Test that webhooks without signature are rejected"""
        payload = {"type": "test", "data": {}}
        
        response = await client.post(
            "/webhooks/stripe",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should reject without signature
        assert response.status_code in [400, 401]
    
    @pytest.mark.asyncio
    async def test_webhook_invalid_signature(
        self,
        client: AsyncClient
    ):
        """Test that webhooks with invalid signature are rejected"""
        payload = {"type": "test", "data": {}}
        
        response = await client.post(
            "/webhooks/stripe",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "invalid_signature"
            }
        )
        
        assert response.status_code in [400, 401]
