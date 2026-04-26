"""
BizGen AI - Chat Tests
Tests for AI chat assistant endpoints
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.models.models import User, Project


class TestChat:
    """Tests for chat endpoints"""
    
    @pytest.mark.asyncio
    async def test_chat_send_message_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test sending a chat message"""
        with patch("app.routers.chat.ai_service") as mock_ai:
            mock_ai.chat = AsyncMock(return_value={
                "response": "Voici quelques conseils pour votre projet...",
                "suggestions": ["Créer un MVP", "Étudier le marché"]
            })
            
            response = await client.post(
                "/chat",
                headers=auth_headers,
                json={
                    "projectId": test_project.id,
                    "message": "Comment puis-je améliorer mon business ?"
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "suggestions" in data
    
    @pytest.mark.asyncio
    async def test_chat_get_history(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test getting chat history"""
        response = await client.get(
            f"/chat/history/{test_project.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
    
    @pytest.mark.asyncio
    async def test_chat_nonexistent_project(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test chat with nonexistent project"""
        response = await client.post(
            "/chat",
            headers=auth_headers,
            json={
                "projectId": "nonexistent-id",
                "message": "Test message"
            }
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_chat_empty_message(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test sending empty message"""
        response = await client.post(
            "/chat",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "message": ""
            }
        )
        
        assert response.status_code == 422  # Validation error
