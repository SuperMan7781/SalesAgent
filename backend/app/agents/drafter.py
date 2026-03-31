# s:\Dev\Work\SalesAgent\backend\app\agents\drafter.py
from app.services.llm_gateway import call_llm
from typing import Dict, List
import json

DRAFTER_PROMPT = """You are an elite cold email copywriter. Write 3 variant cold emails for this prospect.

STRICT RULES:
1. Each email must be ≤100 words (for C-suite mobile readability)
2. The FIRST SENTENCE must connect a real fact about the prospect to the sender's value proposition
3. NO generic openers ("I hope this finds you well", "I came across your profile")
4. NO excessive exclamation marks
5. ONE clear call-to-action: suggest a 15-minute call
6. Include a subject line (≤7 words)
7. Use the prospect's first name
8. DO NOT include links or attachments

Respond in EXACTLY this JSON format:
{
    "variants": [
        {
            "variant": 1,
            "tone": "casual",
            "subject": "Subject line here",
            "body": "Full email body here"
        },
        {
            "variant": 2,
            "tone": "professional",
            "subject": "Subject line here",
            "body": "Full email body here"
        },
        {
            "variant": 3,
            "tone": "bold",
            "subject": "Subject line here",
            "body": "Full email body here"
        }
    ]
}"""

async def draft_emails(
    dossier: Dict,
    hook_data: Dict,
    value_proposition: str,
    sender_name: str,
    tone_preset: str = "professional"
) -> List[Dict]:
    """
    Agent 4: Write 3 variant email drafts.
    Uses Claude Sonnet for highest-quality copy.
    """
    first_name = dossier.get("lead_name", "").split()[0] if dossier.get("lead_name") else "there"

    user_prompt = f"""## Prospect
Name: {dossier.get('lead_name', 'Unknown')}
First Name: {first_name}
Company: {dossier.get('lead_company', 'Unknown')}
Title: {dossier.get('apollo_data', {}).get('title', 'Unknown')}

## Research Dossier
{json.dumps(dossier, indent=2)}

## Selected Hook
Type: {hook_data.get('selected_hook', 'industry_insight')}
Fact: {hook_data.get('hook_fact', '')}
Reasoning: {hook_data.get('hook_reasoning', '')}

## Sender Info
Name: {sender_name}
Value Proposition: {value_proposition}
Preferred Tone: {tone_preset}

Write 3 email variants. Respond in JSON only."""

    response = await call_llm(
        model="claude-sonnet",
        system_prompt=DRAFTER_PROMPT,
        user_prompt=user_prompt,
        temperature=0.8,
        max_tokens=1500,
        response_format="json_object",
    )

    import re
    try:
        # Extract json content from potentially markdown-wrapped string
        cleaned_response = response.strip()
        json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(0)

        result = json.loads(cleaned_response)
        return result.get("variants", [])
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error in Drafter: {e}")
        print(f"Raw Response: {response}")
        return [{
            "variant": 1,
            "tone": tone_preset,
            "subject": f"Quick thought for {first_name}",
            "body": f"Hi {first_name},\n\n{value_proposition}\n\nWould a 15-minute call this week make sense?\n\nBest,\n{sender_name}",
        }]
