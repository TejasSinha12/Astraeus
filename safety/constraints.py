"""
Absolute system constraints that cannot be bypassed by the AGI.
"""
from typing import List, Dict, Any
import os
import re

from core_config import config
from utils.logger import logger

class SystemConstraints:
    """
    Hard-coded boundaries restricting what the AGI is physically allowed to request or do,
    regardless of its internal logic.
    """

    ALLOWED_DIRECTORIES = [
        os.path.abspath(config.MEMORY_INDEX_PATH),
        os.path.abspath("/tmp/ascension_workspace"),
        os.path.abspath("./tools_workspace")
    ]

    BANNED_COMMAND_PATTERNS = [
        re.compile(r"rm -rf /"),
        re.compile(r"mkfs\."),
        re.compile(r"dd if="),
        re.compile(r"> /dev/sda")
    ]

    @classmethod
    def validate_file_access(cls, file_path: str) -> bool:
        """
        Ensures the AGI can only read/write files within designated sandbox directories.
        """
        target = os.path.abspath(file_path)
        for allowed in cls.ALLOWED_DIRECTORIES:
            if target.startswith(allowed):
                return True
        logger.warning(f"Constraint Violation: Attempted access to {file_path}")
        return False

    @classmethod
    def check_command_safety(cls, cmd: str) -> bool:
        """
        Regex-based check against catastrophically destructive shell commands.
        """
        for pattern in cls.BANNED_COMMAND_PATTERNS:
            if pattern.search(cmd):
                logger.warning(f"Constraint Violation: Banned command pattern triggered in: '{cmd}'")
                return False
        return True
