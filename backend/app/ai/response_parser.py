import json
from app.utils.logger import log

class AIResponseParser:
    """
    Safe Parsing for AI Output.
    
    AI models sometimes include extra text (markdown tags like ```json) 
    even when told not to. This parser cleans that up.
    """
    
    @staticmethod
    def parse_test_generation(raw_content: str) -> dict:
        """
        Parses the JSON response from the LLM for test generation.
        """
        try:
            # 1. Try to find JSON block if markdown is used
            if "```json" in raw_content:
                json_str = raw_content.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_content:
                json_str = raw_content.split("```")[1].split("```")[0].strip()
            else:
                json_str = raw_content.strip()
                
            data = json.loads(json_str)
            
            # 2. Basic Validation
            required = ["description", "priority", "test_code"]
            if not all(k in data for k in required):
                raise ValueError(f"Missing required fields in AI response: {data.keys()}")
                
            return data
            
        except Exception as e:
            log.error(f"Failed to parse AI response: {e}. Raw content: {raw_content[:500]}")
            raise ValueError("The AI returned an invalid response format.") from e
