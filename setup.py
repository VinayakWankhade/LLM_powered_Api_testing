from setuptools import setup, find_packages

setup(
    name="llm-testing-framework",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.111.0",
        "uvicorn[standard]==0.30.1",
        "httpx==0.27.0",
        "sqlalchemy==2.0.36",
        "chromadb==0.5.5",
        "openai==1.51.0",
        "pydantic==2.9.2",
        "python-dotenv==1.0.1",
        "tenacity==9.0.0",
        "numpy>=1.22.5,<2.0.0",
        "pandas==2.2.3",
        "scikit-learn==1.5.2",
        "pyyaml==6.0.2",
        "sentence-transformers==3.1.1",
    ],
    extras_require={
        "test": [
            "pytest==8.1.1",
            "pytest-asyncio==0.23.5",
            "pytest-cov==4.1.0",
        ]
    },
)