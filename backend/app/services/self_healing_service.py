from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from fastapi import HTTPException, status

from app.domain.models.test_case import TestCase
from app.domain.models.endpoint import Endpoint
from app.ai.llm_client import get_llm
from app.ai.healing_prompts import HEALING_PROMPT
from app.ai.response_parser import AIResponseParser
from app.utils.logger import log

class SelfHealingService:
    """
    Core Logic for Test Self-Healing.
    
    1. Detects if a test is 'healable' (structure change vs bug).
    2. Calls AI to patch the code.
    3. Updates the DB with the healed version.
    """
    
    @staticmethod
    async def heal_test_case(db: AsyncSession, test_case_id: UUID) -> dict:
        """
        Analyzes and heals a specifically broken test case.
        """
        # 1. Fetch Test Case and its associated Endpoint
        query = select(TestCase, Endpoint).join(Endpoint).where(TestCase.id == test_case_id)
        result = await db.execute(query)
        data = result.first()
        
        if not data:
            raise HTTPException(status_code=404, detail="Test case or endpoint not found.")
            
        test_case, endpoint = data
        
        # 2. Heuristic: Is it healable?
        # In a real app, we'd compare historical metadata. 
        # For this phase, we assume the user called this because metadata shifted.
        log.info(f"Attempting to heal test case {test_case_id} for {endpoint.path}")
        
        # 3. Call AI to Patch
        # We pass the OLD metadata (simulated here) and the NEW metadata from the DB.
        # In a real scenario, we'd track 'endpoint_history'.
        llm = get_llm()
        prompt_text = HEALING_PROMPT.format(
            framework=endpoint.framework,
            old_method="UNKNOWN_OLD", # In a production system, this would be the previous DB version
            old_path="UNKNOWN_OLD",
            new_method=endpoint.method,
            new_path=endpoint.path,
            old_test_code=test_case.test_code
        )
        
        response = llm.invoke(prompt_text)
        patch_data = AIResponseParser.parse_test_generation(response.content) # Reusing the parser logic
        
        # 4. Save to Database
        test_case.test_code = patch_data.get("patched_test_code", test_case.test_code)
        test_case.status = "HEALED"
        test_case.description = f"[HEALED] {test_case.description}\nReason: {patch_data.get('reason')}"
        
        await db.commit()
        await db.refresh(test_case)
        
        log.info(f"Test case {test_case_id} successfully healed.")
        return {
            "test_case_id": test_case_id,
            "status": "HEALED",
            "reason": patch_data.get("reason")
        }
