import os
import shutil
import tempfile
from git import Repo
from pathlib import Path
from app.utils.logger import log

class RepoManager:
    """
    Handles cloning and cleaning up of Git repositories.
    
    Why this?
    We need to read the user's source code, but we don't want to 
    keep it forever. This utility ensures we have a clean, temporary 
    place to scan the code.
    """
    
    @staticmethod
    def clone_repo(git_url: str) -> str:
        """
        Clones a repository to a temporary directory.
        Returns the absolute path to the directory.
        """
        temp_dir = tempfile.mkdtemp(prefix="ai_testgen_")
        log.info(f"Cloning {git_url} into {temp_dir}...")
        
        try:
            Repo.clone_from(git_url, temp_dir, depth=1) # depth=1 for speed
            return temp_dir
        except Exception as e:
            log.error(f"Failed to clone repository: {e}")
            RepoManager.cleanup_repo(temp_dir)
            raise

    @staticmethod
    def cleanup_repo(path: str):
        """
        Deletes the temporary repository directory.
        """
        if os.path.exists(path):
            log.info(f"Cleaning up repository at {path}...")
            # We use ignore_errors=True because sometimes git files 
            # are tricky to delete on Windows.
            shutil.rmtree(path, ignore_errors=True)
