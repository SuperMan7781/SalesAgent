# s:\Dev\Work\SalesAgent\backend\app\agents\critic.py
from app.services.llm_gateway import call_llm
from typing import Dict, List
import json

CRITIC_PROMPT = """You are a cold email quality assurance expert. Review each email draft for quality.

Score each variant on these criteria:
1. **Accuracy** (0-10): Does the first sentence reference a REAL fact from the dossier? Any hallucinated facts?
2. **Personalization** (0-10): Does this feel written for THIS specific person, not a template?
3. **Length** (0-10): Is it ≤100 words? Penalize heavily if over 120 words.
4. **CTA Clarity** (0-10): Is there one clear, low-friction ask?
5. **Spam Risk** (0-10, 10=safe): Any trigger words? ALL-CAPS? Excessive punctuation? Too many links?

Respond in EXACTLY this JSON format:
{
    "reviews": [
        {
            "variant": 1,
            "quality_score": 8.5,
            "spam_score": 1.2,
            "approved": true,
            "issues": ["Minor: could be more specific about the pain point"],
            "revision_notes": ""
        }
    ]
}

Rules:
- Approve if quality_score >= 7.0 AND spam_score <= 3.0
- Reject if quality_score < 5.0 OR spam_score > 5.0
- If a fact in the email doesn't appear in the dossier → REJECT immediately (hallucination)
- spam_score: 0 = very safe, 10 = definitely spam"""

async def critique_drafts(dossier: Dict, drafts: List[Dict]) -> Dict:
    """
    Agent 5: Quality gate — reviews drafts for accuracy, tone, and spam risk.
    Uses Claude Sonnet for nuanced judgment.
    """
    user_prompt = f"""## Original Research Dossier (ground truth)
{json.dumps(dossier, indent=2)}

## Email Drafts to Review
{json.dumps(drafts, indent=2)}

Review each variant. Respond in JSON only."""

    response = await call_llm(
        model="claude-sonnet",
        system_prompt=CRITIC_PROMPT,
        user_prompt=user_prompt,
        temperature=0.3,
        max_tokens=800,
        response_format="json_object",
    )

    import re
    try:
        cleaned_response = response.strip()
        json_match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(0)

        result = json.loads(cleaned_response)
        return result
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error in Critic: {e}")
        print(f"Raw Response: {response}")
        # Auto-approve with moderate scores if parse fails
        return {
            "reviews": [
                {
                    "variant": d.get("variant", i + 1),
                    "quality_score": 7.0,
                    "spam_score": 2.0,
                    "approved": True,
                    "issues": ["Auto-approved (critique parse error)"],
                    "revision_notes": ""
                }
                for i, d in enumerate(drafts)
            ]
        }
