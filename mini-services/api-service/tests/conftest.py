"""
BizGen AI - Test Configuration
Pytest fixtures and configuration
"""
import asyncio
import os
import sys
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, get_db
from app.main import app
from app.models.models import User, Project, FormInput, GeneratedDocument, CanvasData
from app.config import settings


# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session"""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test HTTP client"""
    
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    from httpx import ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create test user"""
    from app.routers.auth import hash_password
    from app.models.models import Subscription
    
    user_password = os.getenv("TEST_USER_PASSWORD", "TestPassword123!")
    user = User(
        email="test@example.com",
        name="Test User",
        passwordHash=hash_password(user_password),
        role="USER"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    sub = Subscription(
        userId=user.id,
        plan="FREE",
        status="ACTIVE"
    )
    db_session.add(sub)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession) -> User:
    """Create test admin user"""
    from app.routers.auth import hash_password
    from app.models.models import Subscription
    
    admin_password = os.getenv("TEST_ADMIN_PASSWORD", "AdminPassword123!")
    
    admin = User(
        email="admin@example.com",
        name="Admin User",
        passwordHash=hash_password(admin_password),
        role="ADMIN"
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    
    sub = Subscription(
        userId=admin.id,
        plan="PRO",
        status="ACTIVE"
    )
    db_session.add(sub)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture
async def auth_headers(test_user: User) -> dict:
    """Create auth headers for test user"""
    from datetime import datetime, timedelta
    from jose import jwt
    
    expire = datetime.utcnow() + timedelta(hours=1)
    token_data = {
        "sub": test_user.id,
        "email": test_user.email,
        "role": test_user.role,
        "exp": expire
    }
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm="HS256")
    
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_auth_headers(test_admin: User) -> dict:
    """Create auth headers for admin user"""
    from datetime import datetime, timedelta
    from jose import jwt
    
    expire = datetime.utcnow() + timedelta(hours=1)
    token_data = {
        "sub": test_admin.id,
        "email": test_admin.email,
        "role": test_admin.role,
        "exp": expire
    }
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm="HS256")
    
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_project(db_session: AsyncSession, test_user: User) -> Project:
    """Create test project"""
    project = Project(
        userId=test_user.id,
        name="Test Project",
        sector="TECH",
        country="CM",
        status="DRAFT"
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def test_form_inputs(db_session: AsyncSession, test_project: Project) -> list[FormInput]:
    """Create test form inputs"""
    inputs = [
        FormInput(
            projectId=test_project.id,
            questionKey="business_name",
            answerValue="Test Business"
        ),
        FormInput(
            projectId=test_project.id,
            questionKey="business_description",
            answerValue="A test business for testing"
        ),
        FormInput(
            projectId=test_project.id,
            questionKey="target_market",
            answerValue="Local market"
        ),
    ]
    db_session.add_all(inputs)
    await db_session.commit()
    return inputs


@pytest_asyncio.fixture
async def test_generated_doc(db_session: AsyncSession, test_project: Project) -> GeneratedDocument:
    """Create test generated document"""
    doc = GeneratedDocument(
        projectId=test_project.id,
        type="FULL",
        status="COMPLETED"
    )
    db_session.add(doc)
    await db_session.commit()
    await db_session.refresh(doc)
    return doc


# Mock fixtures
@pytest.fixture
def mock_ai_service():
    """Mock AI service for testing"""
    from app.schemas.ai_schemas import ValidatedAIResponse, AIResponseType

    bmc_data = {
        "key_partners": ["Partner 1", "Partner 2"],
        "key_activities": ["Activity 1"],
        "key_resources": ["Resource 1"],
        "value_propositions": ["Value 1"],
        "customer_relationships": ["Relationship 1"],
        "channels": ["Channel 1"],
        "customer_segments": ["Segment 1"],
        "cost_structure": {"fixed_costs": [], "variable_costs": []},
        "revenue_streams": []
    }
    lean_data = {
        "problem": ["Problem 1"],
        "solution": ["Solution 1"],
        "unique_value_proposition": "Unique value",
        "unfair_advantage": "Advantage",
        "customer_segments": ["Segment 1"],
        "existing_alternatives": ["Alternative 1"],
        "channels": ["Channel 1"],
        "revenue_streams": ["Revenue 1"],
        "cost_structure": ["Cost 1"],
        "key_metrics": ["Metric 1"]
    }
    bp_data = {
        "executive_summary": "Executive summary",
        "company_overview": {"name": "Test Business"},
        "market_analysis": {"target": "Local market"},
        "products_services": {"main": "Product 1"},
        "marketing_strategy": {"channels": []},
        "operational_plan": {"team": []},
        "financial_projections": {"revenue": []},
        "risk_analysis": {"risks": []}
    }

    with patch("app.services.ai_service.ai_service") as mock, \
         patch("app.routers.generate.enhanced_ai_service") as mock_enhanced:
        mock.generate_bmc = AsyncMock(return_value=bmc_data)
        mock.generate_lean_canvas = AsyncMock(return_value=lean_data)
        mock.generate_business_plan = AsyncMock(return_value=bp_data)

        mock_enhanced.generate_bmc = AsyncMock(return_value=ValidatedAIResponse(
            response_type=AIResponseType.BMC,
            content=bmc_data,
            is_valid=True,
            model_used="gpt-4o-mini",
            generation_time_ms=120.0
        ))
        mock_enhanced.generate_lean_canvas = AsyncMock(return_value=ValidatedAIResponse(
            response_type=AIResponseType.LEAN_CANVAS,
            content=lean_data,
            is_valid=True,
            model_used="gpt-4o-mini",
            generation_time_ms=120.0
        ))
        mock_enhanced.generate_business_plan = AsyncMock(return_value=ValidatedAIResponse(
            response_type=AIResponseType.BUSINESS_PLAN,
            content=bp_data,
            is_valid=True,
            model_used="gpt-4o-mini",
            generation_time_ms=120.0
        ))
        yield mock


@pytest.fixture
def mock_stripe():
    """Mock Stripe for testing"""
    with patch("app.services.payment_service.stripe") as mock:
        mock.Customer.create = MagicMock(return_value={"id": "cus_test123"})
        mock.Subscription.create = MagicMock(return_value={
            "id": "sub_test123",
            "status": "active"
        })
        mock.Webhook.construct_event = MagicMock(return_value={
            "type": "checkout.session.completed",
            "data": {"object": {"customer": "cus_test123"}}
        })
        yield mock
