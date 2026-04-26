"""
BizGen AI - Auth Tests
Tests for authentication endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User


class TestAuthRegistration:
    """Tests for registration endpoint"""
    
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration"""
        response = await client.post(
            "/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecurePassword123!",
                "name": "New User"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "user" in data
        assert data["user"]["email"] == "newuser@example.com"
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, test_user: User):
        """Test registration with duplicate email"""
        response = await client.post(
            "/auth/register",
            json={
                "email": test_user.email,
                "password": "SecurePassword123!",
                "name": "Another User"
            }
        )
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_register_weak_password(self, client: AsyncClient):
        """Test registration with weak password"""
        response = await client.post(
            "/auth/register",
            json={
                "email": "weakpass@example.com",
                "password": "123",  # Too weak
                "name": "Weak User"
            }
        )
        
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email"""
        response = await client.post(
            "/auth/register",
            json={
                "email": "not-an-email",
                "password": "SecurePassword123!",
                "name": "Invalid Email User"
            }
        )
        
        assert response.status_code == 422  # Validation error


class TestAuthLogin:
    """Tests for login endpoint"""
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Test successful login"""
        response = await client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert "user" in data
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """Test login with wrong password"""
        response = await client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "WrongPassword123!"
            }
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with nonexistent user"""
        response = await client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SomePassword123!"
            }
        )
        
        assert response.status_code == 401


class TestAuthMe:
    """Tests for current user endpoint"""
    
    @pytest.mark.asyncio
    async def test_get_current_user_success(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_user: User
    ):
        """Test getting current user"""
        response = await client.get("/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
    
    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self, client: AsyncClient):
        """Test getting current user without token"""
        response = await client.get("/auth/me")
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token"""
        response = await client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401


class TestAuthUpdate:
    """Tests for user update endpoint"""
    
    @pytest.mark.asyncio
    async def test_update_user_name(
        self, 
        client: AsyncClient, 
        auth_headers: dict,
        test_user: User
    ):
        """Test updating user name"""
        response = await client.put(
            "/auth/me",
            headers=auth_headers,
            json={"name": "Updated Name"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
    
    @pytest.mark.asyncio
    async def test_update_user_password(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
        db_session: AsyncSession
    ):
        """Test updating user password"""
        response = await client.put(
            "/auth/me",
            headers=auth_headers,
            json={
                "currentPassword": "TestPassword123!",
                "newPassword": "NewSecurePassword123!"
            }
        )
        
        assert response.status_code == 200
        
        # Verify can login with new password
        login_response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "NewSecurePassword123!"
            }
        )
        assert login_response.status_code == 200


class TestAuthDelete:
    """Tests for user deletion endpoint"""
    
    @pytest.mark.asyncio
    async def test_delete_user(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User
    ):
        """Test deleting user account"""
        response = await client.delete("/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        
        # Verify user cannot login
        login_response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "TestPassword123!"
            }
        )
        assert login_response.status_code == 401
