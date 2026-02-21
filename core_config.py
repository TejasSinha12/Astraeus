"""
Core configuration for Project Ascension.
Loads settings from environment variables with sensible defaults.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class AscensionConfig(BaseSettings):
    """
    Application wide configuration model driven by Pydantic.
    """
    # Application Config
    APP_NAME: str = "Project Ascension"
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"

    # LLM Settings
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_MODEL: str = "gpt-4o"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Memory Settings
    VECTOR_DB_TYPE: str = "faiss"  # Or "chroma"
    MEMORY_INDEX_PATH: str = "./data/memory_index"
    SHORT_TERM_MEMORY_LIMIT: int = 15

    # Engine Constraints
    MAX_PLANNING_STEPS: int = 10
    MAX_TOOL_RETRIES: int = 3

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

config = AscensionConfig()
