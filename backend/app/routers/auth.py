# s:\Dev\Work\SalesAgent\backend\app\routers\auth.py
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase_client
from typing import Optional

router = APIRouter()

async def get_current_user(authorization: str = Header(...)):
    """Extract user from Supabase JWT token."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client()
    
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/me")
async def get_profile(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()
    profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    return profile.data

@router.put("/profile")
async def update_profile(data: dict, authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()
    result = supabase.table("profiles").update(data).eq("id", user.id).execute()
    return result.data

@router.put("/onboarding")
async def complete_onboarding(data: dict, authorization: str = Header(...)):
    """Save onboarding wizard data: value_proposition, icp, tone_preset."""
    user = await get_current_user(authorization)
    supabase = get_supabase_client()
    
    # Update profile
    supabase.table("profiles").update({
        "value_proposition": data.get("value_proposition"),
        "company_name": data.get("company_name"),
        "tone_preset": data.get("tone_preset", "professional"),
        "onboarding_completed": True,
    }).eq("id", user.id).execute()
    
    # Create ICP config
    supabase.table("icp_config").upsert({
        "user_id": user.id,
        "industries": data.get("industries", []),
        "company_sizes": data.get("company_sizes", []),
        "target_roles": data.get("target_roles", []),
        "min_revenue": data.get("min_revenue"),
    }).execute()
    
    return {"message": "Onboarding completed"}
