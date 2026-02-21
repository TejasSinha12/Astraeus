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
            
        # Hardened restrictions
        restricted_imports = ["os", "subprocess", "shutil", "socket", "requests"]
        for forbidden in restricted_imports:
            if f"import {forbidden}" in code or f"from {forbidden}" in code:
                return f"Sandbox Violation: Import of '{forbidden}' is restricted."

        logger.warning(f"EXECUTING HARDENED SANDBOX CODE: {len(code)} bytes.")

        # Wrap code in exception summarizer to save tokens on error
        wrapper_code = f"""
import sys
import traceback

def summarize_exception(e):
    # Generates a token-light summary of the error
    return f"{{type(e).__name__}}: {{str(e)}}"

try:
{self._indent_code(code)}
except Exception as e:
    print(f"SANDBOX_EXC:{{summarize_exception(e)}}", file=sys.stderr)
    sys.exit(1)
"""

        try:
            # Subprocess limits enforced by OS via asyncio
            process = await asyncio.create_subprocess_exec(
                sys.executable, "-c", wrapper_code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
            except asyncio.TimeoutError:
                process.kill()
                await process.communicate()
                return "Execution Timeout: Resource limit exceeded (Time)."

            out = stdout.decode().strip()
            err = stderr.decode().strip()

            if "SANDBOX_EXC:" in err:
                return f"Runtime Error: {err.split('SANDBOX_EXC:')[1]}"

            result = ""
            if out:
                result += f"STDOUT:\n{out}\n"
            if err:
                result += f"STDERR:\n{err}\n"

            return result or "Execution Successful (No Output)."

        except Exception as e:
            logger.error(f"Sandbox fatal failure: {e}")
            return f"Fatal Sandbox Error: {e}"

    def _indent_code(self, code: str) -> str:
        return "\n".join(["    " + line for line in code.splitlines()])
