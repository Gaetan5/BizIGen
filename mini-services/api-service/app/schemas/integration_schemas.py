from pydantic import BaseModel
from typing import Optional
from enum import Enum

class IntegrationService(str, Enum):
    GITHUB = "github"
    GOOGLE_DRIVE = "google_drive"
    ONEDRIVE = "onedrive"

class IntegrationPushRequest(BaseModel):
    project_id: str
    service: IntegrationService
    target_path: str  # ex: repo_name pour github
    filename: str
    content: Optional[str] = None
    token: str

class IntegrationResponse(BaseModel):
    success: bool
    service: IntegrationService
    url: Optional[str] = None
    message: str
