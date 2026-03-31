# s:\Dev\Work\SalesAgent\backend\app\routers\leads.py
from fastapi import APIRouter, HTTPException, Header, Query
from app.database import get_supabase_client
from app.routers.auth import get_current_user
from typing import Optional

router = APIRouter()

@router.get("/campaign/{campaign_id}")
async def get_campaign_leads(
    campaign_id: str,
    status: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    authorization: str = Header(...)
):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()

    query = supabase.table("leads").select("*").eq("campaign_id", campaign_id).eq("user_id", user.id)

    if review_status:
        query = query.eq("review_status", review_status)
    if search:
        query = query.or_(f"first_name.ilike.%{search}%,last_name.ilike.%{search}%,company.ilike.%{search}%")

    result = query.order("created_at").execute()
    return {"leads": result.data}

@router.put("/{lead_id}/review")
async def review_lead(lead_id: str, data: dict, authorization: str = Header(...)):
    """Approve, reject, skip, or discard a lead."""
    user = await get_current_user(authorization)
    supabase = get_supabase_client()

    update_data = {
        "review_status": data.get("review_status"),
    }

    if data.get("selected_variant"):
        update_data["selected_variant"] = data["selected_variant"]
    if data.get("edited_subject"):
        update_data["edited_subject"] = data["edited_subject"]
    if data.get("edited_body"):
        update_data["edited_body"] = data["edited_body"]
    if data.get("tags"):
        update_data["tags"] = data["tags"]

    supabase.table("leads").update(update_data).eq("id", lead_id).eq("user_id", user.id).execute()

    # Log activity
    supabase.table("activity_log").insert({
        "user_id": user.id,
        "lead_id": lead_id,
        "action": f"lead_{data.get('review_status', 'updated')}",
        "details": {"review_status": data.get("review_status")},
    }).execute()

    return {"message": "Lead updated"}

@router.post("/campaign/{campaign_id}/approve-all")
async def approve_all_leads(campaign_id: str, authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()
    supabase.table("leads").update({"review_status": "approved"}).eq("campaign_id", campaign_id).eq("user_id", user.id).eq("review_status", "pending").execute()
    return {"message": "All pending leads approved"}
