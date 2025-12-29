from langchain_openai import ChatOpenAI
from app.core.config import settings

def get_llm(model: str = "anthropic/claude-3.5-sonnet"):
    """
    Returns a LangChain LLM instance configured for OpenRouter.
    """
    return ChatOpenAI(
        model=model,
        openai_api_key=settings.OPENROUTER_API_KEY,
        openai_api_base="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "https://github.com/VinayakWankhade/LLM_powered_Api_testing",
            "X-Title": "AI TestGen"
        }
    )
