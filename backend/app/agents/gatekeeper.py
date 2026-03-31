# s:\Dev\Work\SalesAgent\backend\app\agents\gatekeeper.py
from app.services.llm_gateway import call_llm
from typing import Dict
import json

GATEKEEPER_PROMPT = """You are a lead qualification expert. Your job is to decide if a lead matches the Ideal Customer Profile (ICP).

You will receive:
1. A research dossier about the lead
2. The ICP criteria

Respond in EXACTLY this JSON format, nothing else:
{
    "qualified": true/false,
    "confidence": 0.0-1.0,
    "reason": "1-2 sentence explanation"
}

Rules:
- If the lead clearly matches the ICP → qualified: true
- If the lead clearly does NOT match → qualified: false
- If data is insufficient to decide → qualified: true, confidence: 0.5 (give benefit of doubt)
- Be generous. Only disqualify leads that are clearly wrong (wrong industry, too small, wrong role)."""

async def qualify_lead(dossier: Dict, icp: Dict) -> Dict:
    """
    Agent 2: Qualify or disqualify a lead against ICP criteria.
    Uses Groq/Llama 3 for speed (binary decision, doesn't need frontier model).
    """
    user_prompt = f"""## Research Dossier
{json.dumps(dossier, indent=2)}

## Ideal Customer Profile
- Target Industries: {', '.join(icp.get('industries', ['Any']))}
- Company Sizes: {', '.join(icp.get('company_sizes', ['Any']))}
- Target Roles: {', '.join(icp.get('target_roles', ['Any']))}
- Min Revenue: {icp.get('min_revenue', 'No minimum')}
- Excluded Companies: {', '.join(icp.get('excluded_companies', ['None']))}

Qualify this lead. Respond in JSON only."""

    response = await call_llm(
        model="groq-llama",
        system_prompt=GATEKEEPER_PROMPT,
        user_prompt=user_prompt,
        temperature=0.1,
        max_tokens=200,
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
            "qualification_status": "qualified" if result["qualified"] else "disqualified",
            "qualification_reason": result.get("reason", ""),
            "confidence": result.get("confidence", 0.5),
        }
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error in Gatekeeper: {e}")
        print(f"Raw Response: {response}")
        return {
            "qualification_status": "qualified",
            "qualification_reason": "Auto-qualified (parse error in qualification response)",
            "confidence": 0.5,
        }
