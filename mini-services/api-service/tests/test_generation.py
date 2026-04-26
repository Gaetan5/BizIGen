"""
BizGen AI - Generation Tests
Tests for AI generation endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User, Project, FormInput, GeneratedDocument


class TestGeneration:
    """Tests for generation endpoints"""
    
    @pytest.mark.asyncio
    async def test_generate_bmc_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_form_inputs: list[FormInput],
        mock_ai_service
    ):
        """Test successful BMC generation"""
        response = await client.post(
            "/generate",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "bmc"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "COMPLETED"
        assert "bmc" in data["results"]
    
    @pytest.mark.asyncio
    async def test_generate_lean_canvas_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_form_inputs: list[FormInput],
        mock_ai_service
    ):
        """Test successful Lean Canvas generation"""
        response = await client.post(
            "/generate",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "lean"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "lean" in data["results"]
    
    @pytest.mark.asyncio
    async def test_generate_business_plan_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_form_inputs: list[FormInput],
        mock_ai_service
    ):
        """Test successful Business Plan generation"""
        response = await client.post(
            "/generate",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "bp"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "bp" in data["results"]
    
    @pytest.mark.asyncio
    async def test_generate_all_documents(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_form_inputs: list[FormInput],
        mock_ai_service
    ):
        """Test generating all document types"""
        response = await client.post(
            "/generate",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "all"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "bmc" in data["results"]
        assert "lean" in data["results"]
        assert "bp" in data["results"]
    
    @pytest.mark.asyncio
    async def test_generate_without_form_data(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test generation without form data"""
        response = await client.post(
            "/generate",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "bmc"
            }
        )
        
        assert response.status_code == 400
        assert "no form data" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_generate_nonexistent_project(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test generation with nonexistent project"""
        response = await client.post(
            "/generate",
            headers=auth_headers,
            json={
                "projectId": "nonexistent-id",
                "type": "bmc"
            }
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_get_generation_status(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_generated_doc: GeneratedDocument
    ):
        """Test getting generation status"""
        response = await client.get(
            f"/generate/status/{test_project.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["documentStatus"] == "COMPLETED"


class TestGenerationLimits:
    """Tests for generation limits based on subscription"""
    
    @pytest.mark.asyncio
    async def test_free_user_can_generate(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_form_inputs: list[FormInput],
        mock_ai_service
    ):
        """Test that free user can generate (with limits)"""
        response = await client.post(
            "/generate",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "bmc"
            }
        )
        
        assert response.status_code == 200
    
    # Note: More limit tests would require mocking the subscription service
    # and checking monthly usage counters
