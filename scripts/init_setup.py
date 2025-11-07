"""
Initialize required models and dependencies
"""

import os
import sys
from pathlib import Path
import logging
from sentence_transformers import SentenceTransformer
import chromadb
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_env():
    """Initialize environment variables"""
    load_dotenv()
    required_vars = [
        "OPENAI_API_KEY",
        "MODEL_PATH",
        "CHROMADB_PATH",
        "DATA_PATH"
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        logger.error(f"Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)

def create_directories():
    """Create required directories"""
    directories = [
        os.getenv("MODEL_PATH"),
        os.getenv("CHROMADB_PATH"),
        os.getenv("DATA_PATH"),
        "models/risk_forecaster"
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")

def download_embedding_model():
    """Download the sentence transformer model"""
    model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    try:
        logger.info(f"Downloading embedding model: {model_name}")
        model = SentenceTransformer(model_name)
        logger.info("Embedding model downloaded successfully")
    except Exception as e:
        logger.error(f"Error downloading embedding model: {e}")
        sys.exit(1)

def init_chromadb():
    """Initialize ChromaDB"""
    chroma_path = os.getenv("CHROMADB_PATH")
    try:
        logger.info("Initializing ChromaDB...")
        client = chromadb.PersistentClient(path=chroma_path)
        # Create default collection if it doesn't exist
        client.get_or_create_collection(
            name="api_kb",
            metadata={
                "description": "API testing knowledge base"
            }
        )
        logger.info("ChromaDB initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing ChromaDB: {e}")
        sys.exit(1)

def main():
    """Main initialization function"""
    logger.info("Starting initialization...")
    
    # Initialize environment
    init_env()
    
    # Create directories
    create_directories()
    
    # Download embedding model
    download_embedding_model()
    
    # Initialize ChromaDB
    init_chromadb()
    
    logger.info("Initialization completed successfully")

if __name__ == "__main__":
    main()