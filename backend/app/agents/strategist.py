# s:\Dev\Work\SalesAgent\backend\app\agents\strategist.py
from app.services.llm_gateway import call_llm
from typing import Dict
import json

STRATEGIST_PROMPT = """You are an elite cold email strategist. Your job is to select the single best "hook" or angle for a cold email to this specific prospect.

A hook is the opening concept that connects a REAL FACT about the prospect to the sender's value proposition.

Available hook types:
1. "congratulatory" — Recent promotion, funding round, award, or achievement
2. "trigger_event" — Company just hired, launched product, expanded, or made news
3. "pain_point" — Their tech stack, hiring patterns, or industry signals suggest a specific pain
4. "mutual_connection" — Shared background, alma mater, or industry community
5. "industry_insight" — Relevant industry trend that affects their business

Respond in EXACTLY this JSON format:
{
    "selected_hook": "hook_type",
    "hook_fact": "The specific real fact you'll reference (must come from the dossier)",
    "reasoning": "Why this hook will resonate with this specific person",
    "suggested_tone": "casual" | "professional" | "bold"
}

Rules:
- NEVER invent facts. Only use data from the research dossier.
- If data is thin, use "industry_insight" hook (safest for low-context leads).
- Prioritize hooks with recency — something from the last 3 months beats something from 2 years ago."""

async def select_hook(dossier: Dict, value_proposition: str) -> Dict:
    """
    Agent 3: Select the highest-converting email hook.
    Uses Claude Sonnet for strategic reasoning.
    """
    user_prompt = f"""## Research Dossier
{json.dumps(dossier, indent=2)}

## Sender's Value Proposition
{value_proposition}

Select the best hook for a cold email to this prospect. Respond in JSON only."""

    response = await call_llm(
        model="claude-sonnet",
        system_prompt=STRATEGIST_PROMPT,
        user_prompt=user_prompt,
        temperature=0.7,
        max_tokens=300,
        response_format="json_object",
    )

    import re
    try:
        cleaned_response = response.strip()
        json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(0)

        result = json.loads(cleaned_response)
        return {
            "selected_hook": result.get("selected_hook", "industry_insight"),
            "hook_fact": result.get("hook_fact", ""),
            "hook_reasoning": result.get("reasoning", ""),
            "suggested_tone": result.get("suggested_tone", "professional"),
        }
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error in Strategist: {e}")
        print(f"Raw Response: {response}")
        return {
            "selected_hook": "industry_insight",
            "hook_fact": "",
            "hook_reasoning": "Fallback: using industry insight due to parse error",
            "suggested_tone": "professional",
        }
