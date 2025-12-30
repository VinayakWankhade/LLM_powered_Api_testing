# AI TestGen Backend

Enterprise-grade AI-powered API Test Generation Platform.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Virtual Environment (recommended)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## 🛠 Tech Stack
- **FastAPI**: Backend Framework
- **Loguru**: Structured Logging
- **Pydantic Settings**: Configuration Management
- **Uvicorn**: ASGI Server

## 📍 API Endpoints
- **Health Check**: `GET /api/health`
- **Interactive Documentation**: `GET /docs`
