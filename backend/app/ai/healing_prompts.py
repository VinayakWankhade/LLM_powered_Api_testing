from langchain.prompts import PromptTemplate

"""
AI Healing Prompts
-------------------
These prompts guide the AI to 'repair' broken test code based on changes 
to the API metadata.
"""

HEALING_PROMPT = PromptTemplate.from_template("""
You are a Senior QA Automation Engineer. A test case for an API endpoint has failed because the API metadata changed.
Your task is to 'heal' the test code by updating it to reflect the new signature.

CONTEXT:
Framework: {framework}
Original API: {old_method} {old_path}
New API: {new_method} {new_path}

OLD TEST CODE:
{old_test_code}

INSTRUCTIONS:
1. Identify how the new signature (method/path) differs from the old one.
2. Update the 'pytest' + 'httpx' code to use the correct new method and path.
3. Keep the existing assertion logic the same unless it's obviously broken by the change.
4. DO NOT include any explanatory text outside the JSON.

OUTPUT FORMAT (Strict JSON only):
{{
  "reason": "Detailed explanation of what was changed and why it was healed.",
  "patched_test_code": "import pytest\\nimport httpx\\n..."
}}
""")
