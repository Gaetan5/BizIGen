"""
BizGen AI - Admin Tests
Tests for admin endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User, Project


class TestAdminUsers:
    """Tests for admin user management endpoints"""
    
    @pytest.mark.asyncio
    async def test_list_users_as_admin(
        self,
        client: AsyncClient,
        admin_auth_headers: dict,
        test_user: User
    ):
        """Test listing users as admin"""
        response = await client.get("/admin/users", headers=admin_auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert len(data["users"]) >= 2  # At least admin and test_user
    
    @pytest.mark.asyncio
    async def test_list_users_as_regular_user(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test that regular users cannot list users"""
        response = await client.get("/admin/users", headers=auth_headers)
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_update_user_role(
        self,
        client: AsyncClient,
        admin_auth_headers: dict,
        test_user: User,
        db_session: AsyncSession
    ):
        """Test updating user role"""
        response = await client.put(
            f"/admin/users/{test_user.id}",
            headers=admin_auth_headers,
            json={"role": "ADMIN"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "ADMIN"
    
    @pytest.mark.asyncio
    async def test_delete_user_as_admin(
        self,
        client: AsyncClient,
        admin_auth_headers: dict,
        db_session: AsyncSession
    ):
        """Test deleting a user as admin"""
        # Create a user to delete
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        user = User(
            email="delete_me@example.com",
            name="Delete Me",
            passwordHash=pwd_context.hash("Password123!"),
            role="USER"
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        response = await client.delete(
            f"/admin/users/{user.id}",
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200


class TestAdminStats:
    """Tests for admin statistics endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_dashboard_stats(
        self,
        client: AsyncClient,
        admin_auth_headers: dict,
        test_user: User,
        test_project: Project
    ):
        """Test getting dashboard statistics"""
        response = await client.get("/admin/stats", headers=admin_auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "totalUsers" in data
        assert "totalProjects" in data
        assert "activeSubscriptions" in data
    
    @pytest.mark.asyncio
    async def test_get_revenue_stats(
        self,
        client: AsyncClient,
        admin_auth_headers: dict
    ):
        """Test getting revenue statistics"""
        response = await client.get("/admin/revenue", headers=admin_auth_headers)
        
        assert response.status_code == 200


class TestAdminSubscriptions:
    """Tests for admin subscription management"""
    
    @pytest.mark.asyncio
    async def test_list_subscriptions(
        self,
        client: AsyncClient,
        admin_auth_headers: dict
    ):
        """Test listing all subscriptions"""
        response = await client.get("/admin/subscriptions", headers=admin_auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "subscriptions" in data
    
    @pytest.mark.asyncio
    async def test_update_user_subscription(
        self,
        client: AsyncClient,
        admin_auth_headers: dict,
        test_user: User
    ):
        """Test updating a user's subscription"""
        response = await client.put(
            f"/admin/subscriptions/{test_user.id}",
            headers=admin_auth_headers,
            json={"plan": "PRO", "expiresAt": "2025-12-31"}
        )
        
        assert response.status_code == 200
