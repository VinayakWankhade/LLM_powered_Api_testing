import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from uuid import UUID
from typing import List

from app.utils.repo_manager import RepoManager
from app.utils.route_parsers import RouteParsers
from app.domain.models.endpoint import Endpoint
from app.utils.logger import log

class ScannerService:
    """
    The Orchestrator of the Scanning Engine.
    
    1. It gets a project's git URL.
    2. It asks RepoManager to download it.
    3. It walks every file and asks RouteParsers to find routes.
    4. It saves all discovered routes to our DB.
    """
    
    @staticmethod
    async def scan_project_codebase(db: AsyncSession, project_id: UUID, git_url: str):
        """
        Performs a full scan of a git repository.
        """
        temp_path = None
        try:
            # 1. Clone the repository
            temp_path = RepoManager.clone_repo(git_url)
            
            # 2. Walk through the code and find endpoints
            discovered_endpoints = []
            for root, dirs, files in os.walk(temp_path):
                # Optimization: skip common non-source directories
                if any(skip in root for skip in ['node_modules', '.git', '__pycache__', 'venv']):
                    continue
                    
                for file in files:
                    file_path = os.path.join(root, file)
                    endpoints = RouteParsers.detect_endpoints(file_path)
                    discovered_endpoints.extend(endpoints)
            
            # 3. Save to database
            # First, clean up old endpoints for this project
            delete_query = delete(Endpoint).where(Endpoint.project_id == project_id)
            await db.execute(delete_query)
            
            # Now, add the new ones
            # We use a set to deduplicate (same method + path)
            seen = set()
            for ep_data in discovered_endpoints:
                identifier = f"{ep_data['method']}:{ep_data['path']}"
                if identifier not in seen:
                    db_endpoint = Endpoint(
                        project_id=project_id,
                        method=ep_data['method'],
                        path=ep_data['path'],
                        framework=ep_data['framework']
                    )
                    db.add(db_endpoint)
                    seen.add(identifier)
            
            await db.commit()
            log.info(f"Scan complete for project {project_id}. Found {len(seen)} unique endpoints.")
            return len(seen)

        except Exception as e:
            log.error(f"Error during scan: {e}")
            await db.rollback()
            raise
        finally:
            # 4. Cleanup temporary files
            if temp_path:
                RepoManager.cleanup_repo(temp_path)
