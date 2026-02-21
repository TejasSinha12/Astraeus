"""
Structured logging module for Project Ascension.
Provides a central logger instance for the entire application.
"""
import logging
import sys
from core_config import config

def setup_logger() -> logging.Logger:
    """
    Initializes and returns the root logger with the configured log level 
    and output format.
    
    Returns:
        logging.Logger: The configured logger instance.
    """
    logger = logging.getLogger(config.APP_NAME)
    
    # Do not add duplicate handlers if the logger is already configured
    if not logger.handlers:
        level = getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)
        logger.setLevel(level)

        # Create console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)

        # Create formatter
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(module)s:%(funcName)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # Prevent the logger from propagating to the root logger and printing twice
        logger.propagate = False

    return logger

logger = setup_logger()
