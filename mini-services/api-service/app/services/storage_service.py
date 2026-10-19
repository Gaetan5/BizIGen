"""
BizGen AI - Unified Cloud & Local Storage Service
Handles persistent storage for exported documents (PDF, DOCX, CSV, PNG)
Supports Cloudflare R2, AWS S3, MinIO, with transparent local volume fallback.
"""
import os
import io
import hashlib
import logging
from typing import Optional, Tuple
from pathlib import Path

logger = logging.getLogger("bizgen.storage")

class StorageService:
    def __init__(self):
        self.local_dir = Path(os.environ.get("EXPORTS_DIR", "/app/exports"))
        self.local_dir.mkdir(parents=True, exist_ok=True)
        
        # S3 / Cloudflare R2 configurations
        self.bucket = os.environ.get("S3_BUCKET")
        self.endpoint_url = os.environ.get("S3_ENDPOINT_URL")
        self.access_key = os.environ.get("AWS_ACCESS_KEY_ID")
        self.secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
        self.region = os.environ.get("AWS_REGION", "auto")
        
        self.has_s3 = bool(self.bucket and self.access_key and self.secret_key)
        if self.has_s3:
            logger.info(f"S3 Object Storage active for bucket: {self.bucket}")
        else:
            logger.info(f"Using local persistent volume storage at: {self.local_dir}")

    async def save_file(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str = "application/octet-stream"
    ) -> Tuple[str, str, int]:
        """
        Save file to cloud storage or local volume.
        Returns: (file_key_or_path, file_hash, file_size)
        """
        file_size = len(file_bytes)
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # 1. Always write locally for fast access and cache
        safe_name = f"{file_hash[:12]}_{filename}"
        local_path = self.local_dir / safe_name
        with open(local_path, "wb") as f:
            f.write(file_bytes)
            
        # 2. Upload to S3/R2 if configured
        if self.has_s3:
            try:
                import boto3
                session = boto3.session.Session()
                s3_client = session.client(
                    service_name='s3',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    endpoint_url=self.endpoint_url,
                    region_name=self.region
                )
                s3_client.put_object(
                    Bucket=self.bucket,
                    Key=safe_name,
                    Body=file_bytes,
                    ContentType=content_type
                )
                logger.info(f"Uploaded {safe_name} to S3 bucket {self.bucket}")
                return safe_name, file_hash, file_size
            except Exception as e:
                logger.warning(f"S3 upload failed, retained local file: {e}")

        return safe_name, file_hash, file_size

    def get_file(self, safe_name: str) -> Optional[bytes]:
        """Retrieve file bytes from local or S3"""
        local_path = self.local_dir / safe_name
        if local_path.exists():
            with open(local_path, "rb") as f:
                return f.read()

        if self.has_s3:
            try:
                import boto3
                session = boto3.session.Session()
                s3_client = session.client(
                    service_name='s3',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    endpoint_url=self.endpoint_url,
                    region_name=self.region
                )
                response = s3_client.get_object(Bucket=self.bucket, Key=safe_name)
                return response['Body'].read()
            except Exception as e:
                logger.error(f"Error fetching from S3: {e}")
        return None

storage_service = StorageService()
