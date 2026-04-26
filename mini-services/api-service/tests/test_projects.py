"""
BizGen AI - Projects Tests
Tests for project management endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User, Project, FormInput


class TestProjectsList:
    """Tests for projects list endpoint"""
    
    @pytest.mark.asyncio
    async def test_list_projects_empty(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test listing projects when user has none"""
        response = await client.get("/projects", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["projects"] == []
        assert data["pagination"]["total"] == 0
    
    @pytest.mark.asyncio
    async def test_list_projects_with_data(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test listing projects with data"""
        response = await client.get("/projects", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["projects"]) == 1
        assert data["projects"][0]["id"] == test_project.id
        assert data["pagination"]["total"] == 1
    
    @pytest.mark.asyncio
    async def test_list_projects_pagination(
        self,
        client: AsyncClient,
        auth_headers: dict,
        db_session: AsyncSession,
        test_user: User
    ):
        """Test projects pagination"""
        # Create multiple projects
        for i in range(15):
            project = Project(
                userId=test_user.id,
                name=f"Project {i}",
                sector="TECH",
                country="CM",
                status="DRAFT"
            )
            db_session.add(project)
        await db_session.commit()
        
        # Test first page
        response = await client.get("/projects?page=1&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["projects"]) == 10
        assert data["pagination"]["totalPages"] == 2
        assert data["pagination"]["hasNext"] is True
        
        # Test second page
        response = await client.get("/projects?page=2&limit=10", headers=auth_headers)
        data = response.json()
        assert len(data["projects"]) == 5
        assert data["pagination"]["hasNext"] is False
    
    @pytest.mark.asyncio
    async def test_list_projects_filter_by_status(
        self,
        client: AsyncClient,
        auth_headers: dict,
        db_session: AsyncSession,
        test_user: User
    ):
        """Test filtering projects by status"""
        # Create projects with different statuses
        for status in ["DRAFT", "COMPLETED", "GENERATING"]:
            project = Project(
                userId=test_user.id,
                name=f"Project {status}",
                sector="TECH",
                country="CM",
                status=status
            )
            db_session.add(project)
        await db_session.commit()
        
        response = await client.get("/projects?status=COMPLETED", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["projects"]) == 1
        assert data["projects"][0]["status"] == "COMPLETED"
    
    @pytest.mark.asyncio
    async def test_list_projects_sorting(
        self,
        client: AsyncClient,
        auth_headers: dict,
        db_session: AsyncSession,
        test_user: User
    ):
        """Test projects sorting"""
        import time
        
        # Create projects with time difference
        project1 = Project(
            userId=test_user.id,
            name="Alpha Project",
            sector="TECH",
            country="CM",
            status="DRAFT"
        )
        db_session.add(project1)
        await db_session.commit()
        
        time.sleep(0.1)
        
        project2 = Project(
            userId=test_user.id,
            name="Beta Project",
            sector="TECH",
            country="CM",
            status="DRAFT"
        )
        db_session.add(project2)
        await db_session.commit()
        
        # Test ascending by date
        response = await client.get("/projects?sortBy=createdAt&sortOrder=asc", headers=auth_headers)
        data = response.json()
        assert data["projects"][0]["name"] == "Alpha Project"
        
        # Test descending by date
        response = await client.get("/projects?sortBy=createdAt&sortOrder=desc", headers=auth_headers)
        data = response.json()
        assert data["projects"][0]["name"] == "Beta Project"


class TestProjectCreate:
    """Tests for project creation endpoint"""
    
    @pytest.mark.asyncio
    async def test_create_project_success(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test successful project creation"""
        response = await client.post(
            "/projects",
            headers=auth_headers,
            json={
                "name": "New Project",
                "sector": "TECH",
                "country": "CM"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"
        assert data["sector"] == "TECH"
        assert data["status"] == "DRAFT"
    
    @pytest.mark.asyncio
    async def test_create_project_missing_fields(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test project creation with missing required fields"""
        response = await client.post(
            "/projects",
            headers=auth_headers,
            json={"name": "Incomplete Project"}
        )
        
        assert response.status_code == 422  # Validation error


class TestProjectGet:
    """Tests for getting a single project"""
    
    @pytest.mark.asyncio
    async def test_get_project_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test getting a project by ID"""
        response = await client.get(
            f"/projects/{test_project.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project.id
        assert data["name"] == test_project.name
    
    @pytest.mark.asyncio
    async def test_get_project_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test getting a nonexistent project"""
        response = await client.get(
            "/projects/nonexistent-id",
            headers=auth_headers
        )
        
        assert response.status_code == 404


class TestProjectUpdate:
    """Tests for project update endpoint"""
    
    @pytest.mark.asyncio
    async def test_update_project_name(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test updating project name"""
        response = await client.put(
            f"/projects/{test_project.id}",
            headers=auth_headers,
            json={"name": "Updated Project Name"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project Name"
    
    @pytest.mark.asyncio
    async def test_update_project_sector(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test updating project sector"""
        response = await client.put(
            f"/projects/{test_project.id}",
            headers=auth_headers,
            json={"sector": "AGRO"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["sector"] == "AGRO"


class TestProjectDelete:
    """Tests for project deletion endpoint"""
    
    @pytest.mark.asyncio
    async def test_delete_project_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test successful project deletion"""
        response = await client.delete(
            f"/projects/{test_project.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        # Verify project is deleted
        get_response = await client.get(
            f"/projects/{test_project.id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404


class TestFormInputs:
    """Tests for form inputs endpoints"""
    
    @pytest.mark.asyncio
    async def test_save_form_inputs(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project
    ):
        """Test saving form inputs"""
        response = await client.post(
            f"/projects/{test_project.id}/form",
            headers=auth_headers,
            json={
                "inputs": [
                    {"questionKey": "business_name", "answerValue": "Test Business"},
                    {"questionKey": "description", "answerValue": "Test description"}
                ]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["savedCount"] == 2
    
    @pytest.mark.asyncio
    async def test_get_form_inputs(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_form_inputs: list[FormInput]
    ):
        """Test getting form inputs"""
        response = await client.get(
            f"/projects/{test_project.id}/form",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["inputs"]) == 3
        assert data["inputs"]["business_name"] == "Test Business"
