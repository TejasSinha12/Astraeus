"""
Git tool allowing the AGI to manage its own version control.
"""
import subprocess
import os
from typing import Type
from pydantic import BaseModel, Field

from tools.base_tool import BaseTool
from utils.logger import logger

class GitInput(BaseModel):
    action: str = Field(description="Must be 'status', 'commit', or 'push'.")
    message: str = Field(default="AGI: Automated Commit", description="The commit message. Required if action is 'commit'.")

class GitTool(BaseTool):
    """
    Interface for Git operations within the project root.
    """
    _name = "git_manager"
    _description = "Manages git operations like staging, committing, and pushing. Actions: 'status', 'commit', 'push'."
    _args_schema = GitInput

    def __init__(self, repo_dir: str = "."):
        self.repo_dir = os.path.abspath(repo_dir)

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description

    @property
    def args_schema(self) -> Type[BaseModel]:
        return self._args_schema

    async def execute(self, **kwargs) -> str:
        action = kwargs.get("action", "")
        message = kwargs.get("message", "AGI: Automated Commit")
        branch = kwargs.get("branch", "main")

        try:
            if action == 'status':
                result = subprocess.run(["git", "status"], cwd=self.repo_dir, capture_output=True, text=True)
                return result.stdout or result.stderr

            elif action == 'create_branch':
                subprocess.run(["git", "checkout", "-b", branch], cwd=self.repo_dir, check=True)
                return f"Created and checked out experimental branch: {branch}"

            elif action == 'commit':
                # Enforce Conventional Commits: type: scope -- summary
                # e.g. FEAT: core -- added governance
                if ":" not in message or "--" not in message:
                    message = f"AUTO: swarm -- {message}"
                
                subprocess.run(["git", "add", "."], cwd=self.repo_dir, check=True)
                result = subprocess.run(["git", "commit", "-m", message], cwd=self.repo_dir, capture_output=True, text=True)
                return f"Staged and committed with structured message.\nOutput:\n{result.stdout or result.stderr}"

            elif action == 'push':
                result = subprocess.run(["git", "push", "origin", branch], cwd=self.repo_dir, capture_output=True, text=True)
                return f"Attempted push to remote branch {branch}.\nOutput:\n{result.stdout or result.stderr}"
            
            elif action == 'merge_branch':
                # Merge into main
                subprocess.run(["git", "checkout", "main"], cwd=self.repo_dir, check=True)
                result = subprocess.run(["git", "merge", branch], cwd=self.repo_dir, capture_output=True, text=True)
                return f"Merged {branch} into main.\nOutput:\n{result.stdout or result.stderr}"

            else:
                return f"Error: Unknown action '{action}'"

        except Exception as e:
            logger.error(f"GitTool Error: {e}")
            return f"Error executing git command: {str(e)}"
