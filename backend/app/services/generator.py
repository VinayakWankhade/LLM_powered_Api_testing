from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.ai import get_llm
from app.models.endpoint import Endpoint

class GeneratedTest(BaseModel):
    description: str = Field(description="A brief description of what the test verifies")
    priority: str = Field(description="Priority of the test: High, Medium, Low")
    test_type: str = Field(description="Type: Functional, Security, Performance")
    code: str = Field(description="The executable Pytest or Jest code for this test case")

class TestGenerator:
    """
    Generates API test cases using AI.
    """
    
    SYSTEM_PROMPT = """
    You are an expert QA Automation Engineer. 
    Your task is to generate high-quality, executable API tests based on endpoint information.
    The tests should be robust, cover edge cases, and follow best practices.
    """
    
    USER_PROMPT_TEMPLATE = """
    Generate a comprehensive API test case for the following endpoint:
    Method: {method}
    Path: {path}
    
    Instructions:
    1. Write the test in Python using the `requests` and `pytest` libraries.
    2. Include assertions for status codes and response structure.
    3. Generate realistic sample input data if needed.
    4. Provide the result in the specified JSON format.
    """

    def __init__(self):
        self.llm = get_llm()
        self.parser = PydanticOutputParser(pydantic_object=GeneratedTest)

    async def generate_test_for_endpoint(self, endpoint: Endpoint) -> GeneratedTest:
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.SYSTEM_PROMPT),
            ("user", self.USER_PROMPT_TEMPLATE)
        ])
        
        chain = prompt | self.llm | self.parser
        
        result = await chain.ainvoke({
            "method": endpoint.method,
            "path": endpoint.path
        })
        
        return result

test_generator = TestGenerator()
