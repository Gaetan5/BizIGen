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
from app.routers import auth, projects, generate, export, chat, subscriptions, admin, password_reset, webhooks, onboarding, share, integrations, intelligence

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
    """Redis-backed rate limiter with in-memory fallback"""
    
    def __init__(self, requests: int = 100, window_seconds: int = 60):
        self.requests = requests
        self.window_seconds = window_seconds
        self._storage: dict[str, list[float]] = defaultdict(list)
        self._redis = None
        self._redis_available = False
    
    async def _init_redis(self):
        if self._redis is not None:
            return
        if not settings.REDIS_URL:
            return
        try:
            import redis.asyncio as redis
            self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await self._redis.ping()
            self._redis_available = True
            logger.info("Redis rate limiter initialized")
        except Exception as e:
            logger.warning(f"Redis rate limiter failed, using in-memory: {e}")
            self._redis_available = False

    async def is_allowed(self, key: str) -> tuple[bool, int]:
        """Check if request is allowed. Returns (is_allowed, remaining_requests)"""
        if settings.REDIS_URL and not self._redis_available:
            await self._init_redis()

        if self._redis_available and self._redis:
            try:
                # Use Redis cell or simple window
                redis_key = f"rate_limit:{key}"
                current = await self._redis.get(redis_key)
                if current and int(current) >= self.requests:
                    return False, 0
                
                pipe = self._redis.pipeline()
                await pipe.incr(redis_key)
                await pipe.expire(redis_key, self.window_seconds)
                results = await pipe.execute()
                new_count = int(results[0])
                return True, self.requests - new_count
            except Exception as e:
                logger.warning(f"Redis rate limit error: {e}")

        # Fallback to in-memory
        now = time.time()
        window_start = now - self.window_seconds
        self._storage[key] = [t for t in self._storage[key] if t > window_start]
        if len(self._storage[key]) >= self.requests:
            return False, 0
        self._storage[key].append(now)
        return True, self.requests - len(self._storage[key])
    
    def get_reset_time(self, key: str) -> int:
        return self.window_seconds # Simplifié pour le reset


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
    
    allowed, remaining = await limiter.is_allowed(key)
    
    if not allowed:
        logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
        reset_time = limiter.get_reset_time(key)
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "error": "Too many requests. Please try again later.",
                "retry_after": reset_time
            },
            headers={
                "Retry-After": str(reset_time),
                "X-RateLimit-Limit": str(limiter.requests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time)
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
    BizGen AI Backend API - L'excellence au service de l'entrepreneuriat.
    
    ## Fonctionnalités Avancées
    * **IA Sectorielle** - Finance, Trading, Fintech, Agri.
    * **Audit Stratégique** - Viability Score et mentoring.
    * **Competitor Discovery** - Intelligence marché en temps réel.
    * **Onboarding** - Création de projet conversationnelle.
    * **Collaboration** - Partage sécurisé via liens publics.
    * **API Keys** - Intégrations externes (bg_live_...).
    """,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    openapi_tags=[
        {
            "name": "AI Generation",
            "description": "Le cœur de BizGen. Génération de BMC, Lean Canvas et Business Plans complets.",
        },
        {
            "name": "Strategic Audit",
            "description": "Audit de viabilité, détection de risques et mentoring stratégique par IA.",
        },
        {
            "name": "Collaboration",
            "description": "Gestion des partages sécurisés et des liens publics pour partenaires.",
        },
        {
            "name": "Onboarding",
            "description": "Système conversationnel intelligent pour définir les projets entrepreneurs.",
        },
        {
            "name": "Integrations",
            "description": "Gestion des API Keys personnelles pour la connectivité externe.",
        }
    ]
)


# ============================================
# CORS Configuration
# ============================================
def get_cors_origins() -> list[str]:
    """Get allowed CORS origins based on environment"""
    cors_origins = settings.CORS_ORIGINS
    
    if cors_origins == "*":
        if settings.DEBUG:
            # En développement, on peut être plus flexible mais FastAPI n'aime pas "*" avec credentials
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        logger.error("CORS_ORIGINS='*' is incompatible with allow_credentials=True. Please specify explicit domains.")
        return []
    
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
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; img-src 'self' data: fastly.jsdelivr.net"
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
    """Handle unexpected exceptions - Hide details in production"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Hide sensitive details in production
    error_message = "Internal server error"
    if settings.DEBUG:
        error_message = str(exc)
        
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": error_message,
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred. Please contact support."
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
app.include_router(onboarding.router)
app.include_router(share.router)
app.include_router(webhooks.router)
app.include_router(integrations.router)
app.include_router(intelligence.router)


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
