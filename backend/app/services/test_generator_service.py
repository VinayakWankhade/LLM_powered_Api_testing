from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from fastapi import HTTPException, status

from app.domain.models.endpoint import Endpoint
from app.domain.models.project import Project
from app.ai.llm_client import get_llm
from app.ai.prompt_templates import TEST_GEN_PROMPT
from app.ai.response_parser import AIResponseParser
from app.utils.logger import log

class TestGeneratorService:
    """
    Service Layer for AI Test Generation.
    
    This service is responsible for:
    1. Orchestrating the AI call for a single endpoint.
    2. Merging project context with endpoint data.
    3. Returning clean, structured test data.
    """
    
    @staticmethod
    async def generate_single_test(db: AsyncSession, endpoint_id: UUID) -> dict:
        """
        Generates test data for one specific endpoint.
        """
        # 1. Fetch Endpoint and Project context
        query = select(Endpoint, Project).join(Project).where(Endpoint.id == endpoint_id)
        result = await db.execute(query)
        data = result.first()
        
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Endpoint not found.")
            
        endpoint, project = data
        
        # 2. Prepare AI Prompt
        llm = get_llm()
        prompt_text = TEST_GEN_PROMPT.format(
            project_name=project.name,
            framework=endpoint.framework,
            method=endpoint.method,
            path=endpoint.path
        )
        
        # 3. Call AI
        log.info(f"Calling AI for endpoint: {endpoint.method} {endpoint.path}")
        response = llm.invoke(prompt_text)
        
        # 4. Parse and Return
        return AIResponseParser.parse_test_generation(response.content)
