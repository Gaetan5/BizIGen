"""
BizGen AI - FastAPI Backend Service
Main application entry point
"""
import os
import time
from collections import defaultdict
from typing import Callable
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import logging
from datetime import datetime

from app.config import settings
from app.database import init_db
from app.routers import auth, projects, generate, export, chat, subscriptions, admin, password_reset, webhooks

# Setup structured logging
from app.services.monitoring_service import setup_logging, logger, metrics, health_checker
setup_logging()

# Import queue service
from app.services.queue_service import queue_service

# Initialize Sentry for error tracking (if configured)
from app.services.sentry_service import init_sentry
init_sentry()


# ============================================
# Rate Limiting (Simple in-memory implementation)
# ============================================
class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests: int = 100, window_seconds: int = 60):
        self.requests = requests
        self.window_seconds = window_seconds
        self._storage: dict[str, list[float]] = defaultdict(list)
    
    def is_allowed(self, key: str) -> tuple[bool, int]:
        """Check if request is allowed. Returns (is_allowed, remaining_requests)"""
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean old requests
        self._storage[key] = [t for t in self._storage[key] if t > window_start]
        
        # Check limit
        if len(self._storage[key]) >= self.requests:
            return False, 0
        
        # Add request
        self._storage[key].append(now)
        return True, self.requests - len(self._storage[key])
    
    def get_reset_time(self, key: str) -> float:
        """Get time until rate limit resets"""
        if not self._storage[key]:
            return 0
        return self._storage[key][0] + self.window_seconds - time.time()


# Global rate limiter instance
rate_limiter = RateLimiter(
    requests=settings.RATE_LIMIT_REQUESTS,
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS
)

# Stricter rate limit for auth endpoints
auth_rate_limiter = RateLimiter(requests=10, window_seconds=60)


async def rate_limit_middleware(request: Request, call_next: Callable) -> Response:
    """Rate limiting middleware"""
    # Get client IP
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.headers.get("x-real-ip", "unknown")
    if not client_ip:
        client_ip = request.client.host if request.client else "unknown"
    
    # Use stricter rate limit for auth endpoints
    path = request.url.path
    if path.startswith("/auth/login") or path.startswith("/auth/register"):
        limiter = auth_rate_limiter
        key = f"auth:{client_ip}"
    else:
        limiter = rate_limiter
        key = f"api:{client_ip}"
    
    allowed, remaining = limiter.is_allowed(key)
    
    if not allowed:
        logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "error": "Too many requests. Please try again later.",
                "retry_after": int(limiter.get_reset_time(key))
            },
            headers={
                "Retry-After": str(int(limiter.get_reset_time(key))),
                "X-RateLimit-Limit": str(limiter.requests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(limiter.get_reset_time(key)))
            }
        )
    
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limiter.requests)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(int(limiter.get_reset_time(key)))
    
    return response


# ============================================
# Application Lifespan
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {'production' if not settings.DEBUG else 'development'}")
    
    # Validate critical settings
    if not settings.SECRET_KEY or settings.SECRET_KEY.startswith("dev-"):
        logger.warning("Using development SECRET_KEY. Set SECRET_KEY environment variable in production!")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Start queue processor
    await queue_service.start()
    logger.info("Queue processor started")
    
    # Register health checks
    async def check_database():
        try:
            from app.database import async_session_maker
            async with async_session_maker() as session:
                await session.execute("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    health_checker.register("database", check_database)
    
    yield
    
    # Shutdown
    logger.info("Shutting down queue processor...")
    await queue_service.stop()
    logger.info("Shutting down...")


# ============================================
# Create FastAPI App
# ============================================
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
    
    ## Rate Limiting
    
    - API général: 100 requêtes/minute
    - Auth endpoints: 10 requêtes/minute
    """,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None
)


# ============================================
# CORS Configuration
# ============================================
def get_cors_origins() -> list[str]:
    """Get allowed CORS origins based on environment"""
    cors_origins = settings.CORS_ORIGINS
    
    if cors_origins == "*":
        logger.warning("CORS is set to allow all origins. This is not recommended for production!")
        return ["*"]
    
    # Parse comma-separated origins
    origins = [origin.strip() for origin in cors_origins.split(",")]
    
    # Always allow localhost in development
    if settings.DEBUG:
        origins.extend([
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
        ])
    
    # Remove duplicates
    return list(set(origins))


allowed_origins = get_cors_origins()
logger.info(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "X-Request-ID",
    ],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
    ],
    max_age=3600,  # Cache preflight for 1 hour
)


# ============================================
# Security Headers Middleware
# ============================================
@app.middleware("http")
async def add_security_headers(request: Request, call_next: Callable) -> Response:
    """Add security headers to all responses"""
    response = await rate_limit_middleware(request, call_next)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Request ID for debugging
    request_id = request.headers.get("X-Request-ID", str(int(time.time() * 1000)))
    response.headers["X-Request-ID"] = request_id
    
    return response


# ============================================
# Exception Handlers
# ============================================
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# ============================================
# Health Check Endpoints
# ============================================
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": "production" if not settings.DEBUG else "development",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Readiness check endpoint"""
    return await health_checker.check_all()


@app.get("/metrics", tags=["Health"])
async def get_metrics():
    """Get application metrics"""
    return {
        "metrics": metrics.get_metrics(),
        "queue": queue_service.get_stats()
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "disabled",
        "health": "/health"
    }


# ============================================
# Include Routers
# ============================================
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(generate.router)
app.include_router(export.router)
app.include_router(chat.router)
app.include_router(subscriptions.router)
app.include_router(password_reset.router)
app.include_router(admin.router)
app.include_router(webhooks.router)


# ============================================
# For running with uvicorn
# ============================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
