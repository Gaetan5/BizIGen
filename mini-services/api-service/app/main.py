"""
BizGen AI - FastAPI Backend Service
Main application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime

from app.config import settings
from app.database import init_db
from app.routers import auth, projects, generate, export, chat, subscriptions, admin, password_reset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    BizGen AI Backend API - Génération de Business Plans avec IA
    
    ## Fonctionnalités
    
    * **Authentification** - Inscription, connexion, JWT tokens
    * **Projets** - CRUD pour les projets business
    * **Génération IA** - BMC, Lean Canvas, Business Plan
    * **Exports** - PDF, DOCX, PNG
    * **Chat IA** - Assistant intelligent pour les entrepreneurs
    * **Subscriptions** - Plans Free, Basic, Pro
    
    ## Plans et Limites
    
    | Plan | Projets/mois | Exports | Fonctionnalités |
    |------|-------------|---------|-----------------|
    | Free | 1 | 3 PNG | BMC, Lean Canvas |
    | Basic | 5 | 20 PDF | + Business Plan |
    | Pro | Illimité | Illimité | + DOCX, Templates |
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(generate.router)
app.include_router(export.router)
app.include_router(chat.router)
app.include_router(subscriptions.router)
app.include_router(password_reset.router)
app.include_router(admin.router)


# For running with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=3001,
        reload=True
    )
