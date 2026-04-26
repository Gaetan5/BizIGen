"""
BizGen AI - Queue Service
Job queue for long-running tasks using in-memory queue with optional RabbitMQ support
"""
import asyncio
import json
import logging
import time
import uuid
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from functools import wraps

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Job:
    """Represents a job in the queue"""
    id: str
    type: str
    payload: Dict[str, Any]
    status: JobStatus = JobStatus.PENDING
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Any] = None
    error: Optional[str] = None
    progress: int = 0
    retries: int = 0
    max_retries: int = 3
    priority: int = 0  # Higher = more priority


class QueueService:
    """
    In-memory job queue with async processing
    
    Features:
    - Priority-based job processing
    - Retry logic with exponential backoff
    - Progress tracking
    - Job status queries
    - Concurrent job execution
    """
    
    def __init__(self, max_concurrent_jobs: int = 5):
        self._queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self._jobs: Dict[str, Job] = {}
        self._handlers: Dict[str, Callable] = {}
        self._running: bool = False
        self._workers: List[asyncio.Task] = []
        self._max_concurrent_jobs = max_concurrent_jobs
        self._active_jobs = 0
    
    def register_handler(self, job_type: str, handler: Callable):
        """Register a handler for a job type"""
        self._handlers[job_type] = handler
        logger.info(f"Registered handler for job type: {job_type}")
    
    async def enqueue(
        self,
        job_type: str,
        payload: Dict[str, Any],
        priority: int = 0,
        max_retries: int = 3
    ) -> str:
        """
        Add a job to the queue
        
        Args:
            job_type: Type of job to execute
            payload: Job data
            priority: Higher priority = processed first
            max_retries: Maximum retry attempts on failure
            
        Returns:
            Job ID
        """
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id,
            type=job_type,
            payload=payload,
            priority=priority,
            max_retries=max_retries
        )
        
        self._jobs[job_id] = job
        # Use negative priority for max-heap behavior (higher priority = lower number)
        await self._queue.put((-priority, job.created_at.timestamp(), job_id))
        
        logger.info(f"Enqueued job {job_id} of type {job_type}")
        return job_id
    
    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job status by ID"""
        job = self._jobs.get(job_id)
        if not job:
            return None
        
        return {
            "id": job.id,
            "type": job.type,
            "status": job.status.value,
            "progress": job.progress,
            "created_at": job.created_at.isoformat(),
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "result": job.result,
            "error": job.error
        }
    
    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a pending job"""
        job = self._jobs.get(job_id)
        if not job or job.status != JobStatus.PENDING:
            return False
        
        job.status = JobStatus.CANCELLED
        logger.info(f"Cancelled job {job_id}")
        return True
    
    async def start(self):
        """Start the queue processor"""
        if self._running:
            return
        
        self._running = True
        logger.info("Starting queue processor")
        
        # Start worker tasks
        for i in range(self._max_concurrent_jobs):
            worker = asyncio.create_task(self._worker(i))
            self._workers.append(worker)
    
    async def stop(self):
        """Stop the queue processor"""
        self._running = False
        logger.info("Stopping queue processor")
        
        # Wait for workers to finish
        for worker in self._workers:
            worker.cancel()
        
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()
    
    async def _worker(self, worker_id: int):
        """Worker coroutine for processing jobs"""
        logger.info(f"Worker {worker_id} started")
        
        while self._running:
            try:
                # Try to get a job with timeout
                try:
                    priority, timestamp, job_id = await asyncio.wait_for(
                        self._queue.get(),
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                
                job = self._jobs.get(job_id)
                if not job or job.status == JobStatus.CANCELLED:
                    continue
                
                # Process job
                await self._process_job(job)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}")
                await asyncio.sleep(1)
        
        logger.info(f"Worker {worker_id} stopped")
    
    async def _process_job(self, job: Job):
        """Process a single job"""
        handler = self._handlers.get(job.type)
        if not handler:
            job.status = JobStatus.FAILED
            job.error = f"No handler registered for job type: {job.type}"
            logger.error(job.error)
            return
        
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow()
        
        logger.info(f"Processing job {job.id} of type {job.type}")
        
        try:
            # Create progress callback
            def update_progress(progress: int):
                job.progress = min(100, max(0, progress))
            
            # Execute handler
            if asyncio.iscoroutinefunction(handler):
                result = await handler(job.payload, update_progress)
            else:
                result = handler(job.payload, update_progress)
            
            job.result = result
            job.status = JobStatus.COMPLETED
            job.progress = 100
            job.completed_at = datetime.utcnow()
            
            logger.info(f"Job {job.id} completed successfully")
            
        except Exception as e:
            logger.error(f"Job {job.id} failed: {e}")
            
            # Retry logic
            if job.retries < job.max_retries:
                job.retries += 1
                job.status = JobStatus.PENDING
                
                # Exponential backoff
                delay = 2 ** job.retries
                await asyncio.sleep(delay)
                
                # Re-enqueue with same priority
                await self._queue.put((-job.priority, job.created_at.timestamp(), job.id))
                logger.info(f"Retrying job {job.id} (attempt {job.retries}/{job.max_retries})")
            else:
                job.status = JobStatus.FAILED
                job.error = str(e)
                job.completed_at = datetime.utcnow()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get queue statistics"""
        status_counts = {}
        for job in self._jobs.values():
            status = job.status.value
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "total_jobs": len(self._jobs),
            "queue_size": self._queue.qsize(),
            "status_counts": status_counts,
            "workers": len(self._workers),
            "running": self._running
        }


# Global queue instance
queue_service = QueueService()


# ============================================
# Job Handlers
# ============================================

async def handle_generation_job(payload: Dict[str, Any], update_progress: Callable) -> Dict[str, Any]:
    """Handle AI generation jobs"""
    from app.services.ai_service import ai_service
    
    project_id = payload.get("project_id")
    generation_type = payload.get("type", "all")
    form_data = payload.get("form_data", {})
    sector = payload.get("sector")
    country = payload.get("country")
    
    results = {}
    total_steps = 3 if generation_type == "all" else 1
    current_step = 0
    
    if generation_type in ["bmc", "all"]:
        update_progress(int((current_step / total_steps) * 100))
        results["bmc"] = await ai_service.generate_bmc(form_data, sector, country)
        current_step += 1
    
    if generation_type in ["lean", "all"]:
        update_progress(int((current_step / total_steps) * 100))
        results["lean"] = await ai_service.generate_lean_canvas(form_data, sector)
        current_step += 1
    
    if generation_type in ["bp", "all"]:
        update_progress(int((current_step / total_steps) * 100))
        results["bp"] = await ai_service.generate_business_plan(form_data, sector, country)
        current_step += 1
    
    update_progress(100)
    return results


async def handle_export_job(payload: Dict[str, Any], update_progress: Callable) -> Dict[str, Any]:
    """Handle export jobs"""
    from app.services.export_service import ExportService
    
    export_service = ExportService()
    
    project_id = payload.get("project_id")
    doc_type = payload.get("type")
    format_type = payload.get("format")
    data = payload.get("data")
    project_name = payload.get("project_name", "Untitled")
    
    update_progress(20)
    
    if format_type == "pdf":
        if doc_type == "bmc":
            content = export_service.generate_bmc_pdf(data, project_name)
        elif doc_type == "lean":
            content = export_service.generate_lean_canvas_pdf(data, project_name)
        elif doc_type == "bp":
            content = export_service.generate_business_plan_pdf(data, project_name)
        else:
            raise ValueError(f"Unknown document type: {doc_type}")
    elif format_type == "png":
        if doc_type == "bmc":
            content = export_service.generate_bmc_png(data, project_name)
        elif doc_type == "lean":
            content = export_service.generate_lean_canvas_png(data, project_name)
        else:
            raise ValueError(f"PNG export not supported for: {doc_type}")
    elif format_type == "docx":
        content = export_service.generate_business_plan_docx(data, project_name)
    else:
        raise ValueError(f"Unknown format: {format_type}")
    
    update_progress(100)
    
    return {
        "content_size": len(content),
        "format": format_type
    }


# Register handlers
queue_service.register_handler("generation", handle_generation_job)
queue_service.register_handler("export", handle_export_job)


# ============================================
# Decorators
# ============================================

def queued_job(job_type: str):
    """Decorator to automatically queue function as a job"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            payload = {
                "args": args,
                "kwargs": kwargs,
                "function": func.__name__
            }
            job_id = await queue_service.enqueue(job_type, payload)
            return await queue_service.get_job_status(job_id)
        return wrapper
    return decorator
