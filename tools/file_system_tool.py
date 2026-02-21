"""
File System tool allowing the AGI to read and write files locally.
"""
import os
from typing import Type
from pydantic import BaseModel, Field
import aiofiles

from tools.base_tool import BaseTool
from utils.logger import logger

class FileSystemInput(BaseModel):
    action: str = Field(description="Must be 'read', 'write', or 'list'.")
    path: str = Field(description="The relative file or directory path.")
    content: str = Field(default="", description="The content to write. Required if action is 'write'.")

class FileSystemTool(BaseTool):
    """
    Sandboxed file system interface.
    """
    _name = "file_system"
    _description = "Reads, writes, or lists files in the current working directory. Actions: 'read', 'write', 'list'."
    _args_schema = FileSystemInput

    def __init__(self, sandbox_dir: str = "."):
        self.sandbox_dir = os.path.abspath(sandbox_dir)

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description

    @property
    def args_schema(self) -> Type[BaseModel]:
        return self._args_schema

    def _resolve_path(self, relative_path: str) -> str:
        target = os.path.abspath(os.path.join(self.sandbox_dir, relative_path))
        if not target.startswith(self.sandbox_dir):
            raise ValueError(f"Security Error: Path {target} attempts to break out of sandbox {self.sandbox_dir}")
        return target

    async def execute(self, **kwargs) -> str:
        action = kwargs.get("action", "")
        file_path = kwargs.get("path", "")
        content = kwargs.get("content", "")

        try:
            safe_path = self._resolve_path(file_path)

            if action == 'list':
                if not os.path.exists(safe_path) or not os.path.isdir(safe_path):
                    return f"Error: Directory does not exist {file_path}"
                items = os.listdir(safe_path)
                return f"Contents of {file_path}:\n" + "\n".join(items)

            elif action == 'read':
                if not os.path.exists(safe_path) or not os.path.isfile(safe_path):
                    return f"Error: File does not exist {file_path}"
                async with aiofiles.open(safe_path, mode='r') as f:
                    data = await f.read()
                return f"--- FILE: {file_path} ---\n{data}\n--- END ---"

            elif action == 'write':
                os.makedirs(os.path.dirname(safe_path), exist_ok=True)
                async with aiofiles.open(safe_path, mode='w') as f:
                    await f.write(content)
                return f"Successfully wrote {len(content)} characters to {file_path}"

            else:
                return f"Error: Unknown action '{action}'"

        except Exception as e:
            logger.error(f"FileSystemTool Error: {e}")
            return f"Error accessing file system: {str(e)}"
