"""
BizGen AI - Integration Hub
Universal connector for external services (Google, GitHub, Office 365, etc.)
"""
import logging
import httpx
import json
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class IntegrationHub:
    """
    Gère les connexions et le transfert de données vers des écosystèmes tiers.
    Permet aux entrepreneurs de pousser leurs documents générés (BMC, Business Plan)
    directement sur leurs outils de productivité.
    """
    
    def __init__(self):
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    async def push_to_github(self, repo_full_name: str, path: str, content: str, token: str, message: str = "Update from BizGen AI"):
        """
        Pousse un fichier ou de la documentation générée vers un dépôt GitHub.
        """
        logger.info(f"Pushing to GitHub repo: {repo_full_name} at {path}")
        
        url = f"https://api.github.com/repos/{repo_full_name}/contents/{path}"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # 1. Vérifier si le fichier existe déjà pour obtenir le SHA
            res = await client.get(url, headers=headers)
            sha = None
            if res.status_code == 200:
                sha = res.json().get("sha")
            
            # 2. Préparer le payload
            import base64
            encoded_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
            
            data = {
                "message": message,
                "content": encoded_content,
            }
            if sha:
                data["sha"] = sha
                
            # 3. Pousser le contenu (PUT)
            response = await client.put(url, headers=headers, json=data)
            
            if response.status_code in [200, 201]:
                return {
                    "status": "success",
                    "service": "github",
                    "url": response.json().get("content", {}).get("html_url")
                }
            else:
                logger.error(f"GitHub Error: {response.text}")
                return {"status": "error", "message": response.text}

    async def push_to_google_drive(self, filename: str, content: str, access_token: str):
        """
        Crée un document dans Google Drive via upload multipart.
        """
        logger.info(f"Pushing document to Google Drive: {filename}")
        
        url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        # Construction manuelle du corps multipart/related pour éviter les dépendances lourdes
        boundary = "bizgen_boundary"
        headers["Content-Type"] = f"multipart/related; boundary={boundary}"
        
        metadata = json.dumps({"name": filename, "mimeType": "text/markdown"})
        
        body = (
            f"--{boundary}\n"
            f"Content-Type: application/json; charset=UTF-8\n\n"
            f"{metadata}\n"
            f"--{boundary}\n"
            f"Content-Type: text/markdown\n\n"
            f"{content}\n"
            f"--{boundary}--"
        )
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, content=body)
            
            if response.status_code in [200, 201]:
                file_id = response.json().get("id")
                return {
                    "status": "success", 
                    "service": "google",
                    "url": f"https://drive.google.com/file/d/{file_id}/view",
                    "message": "Document créé avec succès dans Google Drive"
                }
            else:
                logger.error(f"Google Drive Error: {response.text}")
                return {"status": "error", "message": response.text}

    async def push_to_onedrive(self, filename: str, content: str, access_token: str):
        """
        Intégration avec Microsoft OneDrive via Microsoft Graph API.
        """
        logger.info(f"Pushing to OneDrive: {filename}")
        
        # Endpoint Microsoft Graph pour OneDrive
        url = f"https://graph.microsoft.com/v1.0/me/drive/root:/{filename}:/content"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "text/plain"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.put(url, headers=headers, content=content)
            
            if response.status_code in [200, 201]:
                return {"status": "success", "service": "microsoft"}
            else:
                logger.error(f"OneDrive Error: {response.text}")
                return {"status": "error", "message": response.text}

# Instance singleton
integration_hub = IntegrationHub()
