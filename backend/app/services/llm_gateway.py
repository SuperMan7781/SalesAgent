# s:\Dev\Work\SalesAgent\backend\app\services\llm_gateway.py
import litellm
from app.config import get_settings
from typing import Optional

# Configure LiteLLM
litellm.set_verbose = False

# Groq free-tier model — used for ALL calls when no Anthropic key is set
GROQ_FREE_MODEL = "groq/llama-3.3-70b-versatile"


def _resolve_model(model: str, settings) -> tuple[str, str | None]:
    """
    Resolve a logical model name to an actual LiteLLM model + api_key.

    FREE-TESTING MODE (ANTHROPIC_API_KEY is blank):
        ALL models route to Groq llama-3.3-70b-versatile at no cost.

    PRODUCTION MODE (ANTHROPIC_API_KEY is set):
        - "claude-sonnet" → claude-3-5-sonnet-20241022  (best quality)
        - "groq-llama"    → groq/llama-3.3-70b-versatile (fast/cheap)
        - "gpt-4o"        → gpt-4o

    To switch modes, just fill in / blank out ANTHROPIC_API_KEY in .env.
    No agent code needs to change.
    """
    # --- FREE-TESTING MODE ---
    if not settings.ANTHROPIC_API_KEY:
        return GROQ_FREE_MODEL, settings.GROQ_API_KEY

    # --- PRODUCTION MODE ---
    model_map = {
        "claude-sonnet": ("claude-3-5-sonnet-20241022", settings.ANTHROPIC_API_KEY),
        "groq-llama":    (GROQ_FREE_MODEL,               settings.GROQ_API_KEY),
        "gpt-4o":        ("gpt-4o",                      None),  # uses env OPENAI_API_KEY
    }
    return model_map.get(model, (model, None))


async def call_llm(
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    response_format: Optional[str] = None,
) -> str:
    """
    Universal LLM call with smart routing and auto-failover.

    Pass one of:  "claude-sonnet" | "groq-llama" | "gpt-4o"

    If ANTHROPIC_API_KEY is blank, every model transparently routes to
    Groq's free llama-3.3-70b-versatile so the full pipeline works at zero cost.
    Populate ANTHROPIC_API_KEY later to restore premium quality — no other
    code changes required.
    """
    settings = get_settings()
    actual_model, api_key = _resolve_model(model, settings)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        kwargs = dict(
            model=actual_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        if api_key:
            kwargs["api_key"] = api_key
        if response_format == "json_object":
            kwargs["response_format"] = {"type": "json_object"}

        response = await litellm.acompletion(**kwargs)
        return response.choices[0].message.content

    except Exception as e:
        # Failover: try Groq free model (works as long as GROQ_API_KEY is set)
        if actual_model != GROQ_FREE_MODEL and settings.GROQ_API_KEY:
            try:
                response = await litellm.acompletion(
                    model=GROQ_FREE_MODEL,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    api_key=settings.GROQ_API_KEY,
                )
                return response.choices[0].message.content
            except Exception:
                pass
        raise Exception(f"All LLM providers failed: {str(e)}")