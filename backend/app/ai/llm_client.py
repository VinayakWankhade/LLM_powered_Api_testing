from langchain_community.chat_models import ChatOpenAI
from app.config import settings

def get_llm():
    """
    Initializes the LangChain ChatOpenAI client configured for OpenRouter.
    
    Why OpenRouter?
    It gives us access to multiple high-quality models (DeepSeek, GPT-4, etc.) 
    using a single API, which is perfect for an enterprise AI tool.
    """
    return ChatOpenAI(
        model_name=settings.OPENROUTER_MODEL,
        openai_api_key=settings.OPENROUTER_API_KEY,
        openai_api_base="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "https://github.com/VinayakWankhade/LLM_powered_Api_testing",
            "X-Title": "AI TestGen",
        }
    )
