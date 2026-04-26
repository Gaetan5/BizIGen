"""
BizGen AI - Monitoring Service
Structured logging, metrics, and health monitoring
"""
import json
import logging
import sys
import time
from datetime import datetime
from typing import Any, Dict, Optional
from functools import wraps
from contextlib import contextmanager
import traceback

from app.config import settings


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data["data"] = record.extra_data
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": traceback.format_exception(*record.exc_info)
            }
        
        # Add request ID if present
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        # Add user ID if present
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        
        return json.dumps(log_data)


class StructuredLogger:
    """Structured logger with context support"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self._context: Dict[str, Any] = {}
    
    def set_context(self, **kwargs):
        """Set context for all subsequent log messages"""
        self._context.update(kwargs)
    
    def clear_context(self):
        """Clear the logging context"""
        self._context = {}
    
    def _log(self, level: int, message: str, **kwargs):
        """Internal logging method"""
        extra_data = {**self._context, **kwargs}
        self.logger.log(level, message, extra={"extra_data": extra_data})
    
    def debug(self, message: str, **kwargs):
        self._log(logging.DEBUG, message, **kwargs)
    
    def info(self, message: str, **kwargs):
        self._log(logging.INFO, message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        self._log(logging.WARNING, message, **kwargs)
    
    def error(self, message: str, **kwargs):
        self._log(logging.ERROR, message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        self._log(logging.CRITICAL, message, **kwargs)
    
    def exception(self, message: str, **kwargs):
        """Log exception with traceback"""
        self.logger.exception(message, extra={"extra_data": {**self._context, **kwargs}})


def setup_logging():
    """Setup structured logging for the application"""
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(
        logging.DEBUG if settings.DEBUG else logging.INFO
    )
    
    # Silence noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


# Create logger instance
logger = StructuredLogger("bizgen")


# ============================================
# Metrics Collection
# ============================================

class MetricsCollector:
    """Simple metrics collector for monitoring"""
    
    def __init__(self):
        self._counters: Dict[str, int] = {}
        self._histograms: Dict[str, list] = {}
        self._gauges: Dict[str, float] = {}
    
    def increment(self, metric: str, value: int = 1, tags: Optional[Dict] = None):
        """Increment a counter"""
        key = self._make_key(metric, tags)
        self._counters[key] = self._counters.get(key, 0) + value
    
    def record(self, metric: str, value: float, tags: Optional[Dict] = None):
        """Record a value for histogram"""
        key = self._make_key(metric, tags)
        if key not in self._histograms:
            self._histograms[key] = []
        self._histograms[key].append(value)
    
    def gauge(self, metric: str, value: float, tags: Optional[Dict] = None):
        """Set a gauge value"""
        key = self._make_key(metric, tags)
        self._gauges[key] = value
    
    def timing(self, metric: str, duration_ms: float, tags: Optional[Dict] = None):
        """Record timing in milliseconds"""
        self.record(metric, duration_ms, tags)
    
    def _make_key(self, metric: str, tags: Optional[Dict] = None) -> str:
        if not tags:
            return metric
        tag_str = ",".join(f"{k}={v}" for k, v in sorted(tags.items()))
        return f"{metric}:{tag_str}"
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get all collected metrics"""
        return {
            "counters": dict(self._counters),
            "gauges": dict(self._gauges),
            "histograms": {
                k: {
                    "count": len(v),
                    "min": min(v) if v else 0,
                    "max": max(v) if v else 0,
                    "avg": sum(v) / len(v) if v else 0,
                }
                for k, v in self._histograms.items()
            }
        }
    
    def reset(self):
        """Reset all metrics"""
        self._counters.clear()
        self._histograms.clear()
        self._gauges.clear()


# Global metrics collector
metrics = MetricsCollector()


# ============================================
# Decorators and Context Managers
# ============================================

def timed(metric_name: str, tags: Optional[Dict] = None):
    """Decorator to time function execution"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                metrics.timing(
                    metric_name,
                    (time.time() - start_time) * 1000,
                    {**(tags or {}), "status": "success"}
                )
                return result
            except Exception as e:
                metrics.timing(
                    metric_name,
                    (time.time() - start_time) * 1000,
                    {**(tags or {}), "status": "error", "error_type": type(e).__name__}
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                metrics.timing(
                    metric_name,
                    (time.time() - start_time) * 1000,
                    {**(tags or {}), "status": "success"}
                )
                return result
            except Exception as e:
                metrics.timing(
                    metric_name,
                    (time.time() - start_time) * 1000,
                    {**(tags or {}), "status": "error", "error_type": type(e).__name__}
                )
                raise
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


@contextmanager
def log_context(**kwargs):
    """Context manager for setting logging context"""
    logger.set_context(**kwargs)
    try:
        yield
    finally:
        logger.clear_context()


class RequestLogger:
    """Middleware for request logging"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request_id = scope.get("headers", {}).get(b"x-request-id", b"").decode() or str(int(time.time() * 1000))
        path = scope.get("path", "")
        method = scope.get("method", "")
        
        # Set context
        logger.set_context(request_id=request_id, path=path, method=method)
        
        start_time = time.time()
        
        # Log request
        logger.info(
            "Request started",
            method=method,
            path=path,
            query=scope.get("query_string", b"").decode()
        )
        
        # Track response
        status_code = None
        
        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "response.start":
                status_code = message["status"]
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
            
            duration_ms = (time.time() - start_time) * 1000
            metrics.increment("requests_total", tags={"method": method, "status": str(status_code)})
            metrics.timing("request_duration_ms", duration_ms, tags={"method": method, "path": path})
            
            logger.info(
                "Request completed",
                status_code=status_code,
                duration_ms=round(duration_ms, 2)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            metrics.increment("requests_total", tags={"method": method, "status": "500"})
            metrics.timing("request_duration_ms", duration_ms, tags={"method": method, "path": path, "status": "error"})
            
            logger.exception(
                "Request failed",
                error_type=type(e).__name__,
                duration_ms=round(duration_ms, 2)
            )
            raise
        
        finally:
            logger.clear_context()


# ============================================
# Health Check
# ============================================

class HealthChecker:
    """Health check for application dependencies"""
    
    def __init__(self):
        self._checks: Dict[str, callable] = {}
    
    def register(self, name: str, check_fn: callable):
        """Register a health check"""
        self._checks[name] = check_fn
    
    async def check_all(self) -> Dict[str, Any]:
        """Run all health checks"""
        results = {}
        overall_status = "healthy"
        
        for name, check_fn in self._checks.items():
            try:
                result = await check_fn() if callable(check_fn) else check_fn
                results[name] = {
                    "status": "healthy" if result else "unhealthy",
                    "details": result if isinstance(result, dict) else None
                }
                if not result or (isinstance(result, dict) and result.get("status") == "unhealthy"):
                    overall_status = "unhealthy"
            except Exception as e:
                results[name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                overall_status = "unhealthy"
        
        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "checks": results,
            "version": settings.APP_VERSION
        }


# Global health checker
health_checker = HealthChecker()
