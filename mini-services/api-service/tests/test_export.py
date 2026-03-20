"""
BizGen AI - Export Tests
Tests for document export endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User, Project, GeneratedDocument, CanvasData
import json


class TestExport:
    """Tests for export endpoints"""
    
    @pytest.mark.asyncio
    async def test_export_pdf_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_generated_doc: GeneratedDocument,
        db_session: AsyncSession
    ):
        """Test successful PDF export"""
        # Add canvas data
        canvas = CanvasData(
            docId=test_generated_doc.id,
            canvasType="BUSINESS_MODEL_CANVAS",
            blocks=json.dumps({
                "key_partners": ["Partner 1"],
                "key_activities": ["Activity 1"],
                "key_resources": ["Resource 1"],
                "value_propositions": ["Value 1"],
                "customer_relationships": ["Relationship 1"],
                "channels": ["Channel 1"],
                "customer_segments": ["Segment 1"],
                "cost_structure": {"fixed_costs": [], "variable_costs": []},
                "revenue_streams": []
            })
        )
        db_session.add(canvas)
        await db_session.commit()
        
        response = await client.post(
            "/export",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "bmc",
                "format": "pdf"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
    
    @pytest.mark.asyncio
    async def test_export_png_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_generated_doc: GeneratedDocument,
        db_session: AsyncSession
    ):
        """Test successful PNG export"""
        # Add canvas data
        canvas = CanvasData(
            docId=test_generated_doc.id,
            canvasType="LEAN_CANVAS",
            blocks=json.dumps({
                "problem": ["Problem 1"],
                "solution": ["Solution 1"],
                "unique_value_proposition": "Value",
                "unfair_advantage": "Advantage",
                "customer_segments": ["Segment 1"],
                "existing_alternatives": ["Alternative 1"],
                "channels": ["Channel 1"],
                "revenue_streams": ["Revenue 1"],
                "cost_structure": ["Cost 1"],
                "key_metrics": ["Metric 1"]
            })
        )
        db_session.add(canvas)
        await db_session.commit()
        
        response = await client.post(
            "/export",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "lean",
                "format": "png"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
    
    @pytest.mark.asyncio
    async def test_export_docx_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_generated_doc: GeneratedDocument,
        db_session: AsyncSession
    ):
        """Test successful DOCX export for Business Plan"""
        # Add business plan data
        test_generated_doc.rawContent = json.dumps({
            "executive_summary": "Executive summary",
            "company_overview": {"name": "Test Business"},
            "market_analysis": {"target": "Local market"}
        })
        await db_session.commit()
        
        response = await client.post(
            "/export",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "bp",
                "format": "docx"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
    
    @pytest.mark.asyncio
    async def test_export_nonexistent_project(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test export with nonexistent project"""
        response = await client.post(
            "/export",
            headers=auth_headers,
            json={
                "projectId": "nonexistent-id",
                "type": "bmc",
                "format": "pdf"
            }
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_export_invalid_format(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test export with invalid format"""
        response = await client.post(
            "/export",
            headers=auth_headers,
            json={
                "projectId": test_project.id,
                "type": "bmc",
                "format": "invalid"
            }
        )
        
        assert response.status_code == 422  # Validation error
