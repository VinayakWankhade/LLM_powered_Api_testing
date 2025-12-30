from langchain.prompts import PromptTemplate

"""
AI Prompt Engineering
----------------------
We use controlled prompts to ensure the AI behaves like a senior 
QA engineer and returns data in a format our code can understand.
"""

TEST_GEN_PROMPT = PromptTemplate.from_template("""
You are a Senior QA Automation Engineer. Your task is to generate a professional, executable API test case.

CONTEXT:
Project Name: {project_name}
Framework: {framework}
HTTP Method: {method}
API Path: {path}

INSTRUCTIONS:
1. Write a Python test case that uses the 'pytest' framework and 'httpx' library.
2. The test should verify the status code and at least one other property of the response.
3. Keep the code concise and production-grade.
4. DO NOT include any explanatory text outside the JSON.

OUTPUT FORMAT (Strict JSON only):
{{
  "description": "Short description of what the test does",
  "priority": "HIGH or MEDIUM or LOW",
  "test_code": "import pytest\\nimport httpx\\n..."
}}
""")
