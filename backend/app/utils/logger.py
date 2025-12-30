import sys
from loguru import logger

def setup_logging():
    """
    Setup structured logging with loguru.
    
    Why this?
    Standard Python logging is complex to configure. Loguru makes it 
    easy to have colorful, structured logs that are easy to read.
    """
    # Remove default handler
    logger.remove()
    
    # Add a new beautiful console handler
    logger.add(
        sys.stdout, 
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    
    return logger

# Create a logger instance to use throughout the app
log = setup_logging()
