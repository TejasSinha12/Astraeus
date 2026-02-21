"""
Python code execution boundary for Project Ascension.
Executes generated code in a subprocess.
"""
import sys
import asyncio
from typing import Type
from pydantic import BaseModel, Field

from tools.base_tool import BaseTool
from utils.logger import logger

class CodeExecutionInput(BaseModel):
    code: str = Field(description="The raw Python code string to execute. Do not include markdown formatting like ```python.")
    timeout: int = Field(default=10, description="Max execution time in seconds before SIGKILL.")

class CodeExecutionTool(BaseTool):
    """
    Subprocess isolated execution environment.
    """
    _name = "python_execution"
    _description = "Executes raw python code in an isolated subprocess. Returns STDOUT or STDERR. Prints statements to return data."
    _args_schema = CodeExecutionInput

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
        code = kwargs.get("code", "")
        timeout = kwargs.get("timeout", 10)

        if not code:
            return "Error: No code provided."
            
        logger.warning(f"EXECUTING UNTRUSTED CODE BLOCK: {len(code)} bytes.")

        try:
            # We spin up a new python interpreter as an async subprocess
            # This is safer than eval() or exec() inside our own memory space.
            process = await asyncio.create_subprocess_exec(
                sys.executable, "-c", code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
            except asyncio.TimeoutError:
                process.kill()
                await process.communicate()
                return f"Execution Timeout Error: Code ran for longer than {timeout} seconds and was killed."

            out = stdout.decode().strip()
            err = stderr.decode().strip()

            result = ""
            if out:
                result += f"STDOUT:\n{out}\n"
            if err:
                result += f"STDERR:\n{err}\n"

            if not result:
                result = "Execution finished successfully with no printed output."

            return result

        except Exception as e:
            logger.error(f"CodeExecutionTool failed fatally: {e}")
            return f"Fatal Sandbox Error: {e}"
