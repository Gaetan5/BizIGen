"""
BizGen AI - Sentry Integration
Error tracking and performance monitoring
"""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
import logging

from app.config import settings


def init_sentry():
    """Initialize Sentry SDK for error tracking"""
    
    if not settings.SENTRY_DSN:
        logging.info("Sentry DSN not configured, skipping Sentry initialization")
        return
    
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment="production" if not settings.DEBUG else "development",
        release=f"bizgen-api@{settings.APP_VERSION}",
        traces_sample_rate=0.1,  # 10% of transactions
        profiles_sample_rate=0.1,  # 10% of profiles
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            SqlalchemyIntegration(),
            LoggingIntegration(level=logging.INFO, event_level=logging.ERROR),
        ],
        before_send=before_send_callback,
        before_send_transaction=before_send_transaction_callback,
    )
    
    logging.info("Sentry initialized successfully")


def before_send_callback(event: dict, hint: dict) -> dict:
    """
    Callback to filter/modify events before sending to Sentry
    - Remove sensitive data
    - Filter out specific errors
    - Add custom context
    """
    # Remove sensitive headers
    if "request" in event and "headers" in event["request"]:
        headers = event["request"]["headers"]
        sensitive_headers = ["authorization", "cookie", "x-api-key"]
        for header in sensitive_headers:
            if header in headers:
                headers[header] = "[Filtered]"
    
    # Remove sensitive body fields
    if "request" in event and "data" in event["request"]:
        data = event["request"]["data"]
        if isinstance(data, dict):
            sensitive_fields = ["password", "token", "secret", "credit_card"]
            for field in sensitive_fields:
                if field in data:
                    data[field] = "[Filtered]"
    
    return event


def before_send_transaction_callback(event: dict, hint: dict) -> dict:
    """
    Callback to filter/modify transactions before sending
    """
    # Skip health check transactions
    if "request" in event:
        path = event["request"].get("url", "")
        if "/health" in path or "/ready" in path or "/metrics" in path:
            return None
    
    return event


def capture_exception(exc: Exception, **kwargs):
    """Capture an exception with additional context"""
    sentry_sdk.capture_exception(exc, **kwargs)


def capture_message(message: str, level: str = "info"):
    """Capture a message"""
    sentry_sdk.capture_message(message, level=level)


def set_user_context(user_id: str, email: str = None, username: str = None):
    """Set user context for error tracking"""
    sentry_sdk.set_user({
        "id": user_id,
        "email": email,
        "username": username
    })


def clear_user_context():
    """Clear user context"""
    sentry_sdk.set_user(None)


def add_breadcrumb(category: str, message: str, level: str = "info", **data):
    """Add a breadcrumb for debugging"""
    sentry_sdk.add_breadcrumb(
        category=category,
        message=message,
        level=level,
        data=data
    )


def start_transaction(name: str, op: str = "http.server"):
    """Start a new transaction for performance monitoring"""
    return sentry_sdk.start_transaction(name=name, op=op)


# Context manager for transactions
class Transaction:
    """Context manager for Sentry transactions"""
    
    def __init__(self, name: str, op: str = "http.server"):
        self.name = name
        self.op = op
        self.transaction = None
    
    def __enter__(self):
        self.transaction = start_transaction(self.name, self.op)
        return self.transaction
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.transaction:
            if exc_type:
                self.transaction.set_status("internal_error")
            self.transaction.finish()
