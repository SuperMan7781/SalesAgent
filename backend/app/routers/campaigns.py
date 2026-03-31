# s:\Dev\Work\SalesAgent\backend\app\routers\campaigns.py
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, BackgroundTasks
from app.database import get_supabase_client
from app.routers.auth import get_current_user
from app.utils.csv_parser import parse_csv_leads
from app.agents.pipeline import process_campaign
import uuid

router = APIRouter()

@router.get("/")
async def list_campaigns(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()
    result = supabase.table("campaigns").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return {"campaigns": result.data}

@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str, authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()
    result = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user.id).single().execute()
    return result.data

@router.post("/")
async def create_campaign(
    name: str,
    file: UploadFile = File(...),
    authorization: str = Header(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()

    # Parse CSV
    contents = await file.read()
    leads = parse_csv_leads(contents.decode("utf-8"))

    # Create campaign
    campaign_id = str(uuid.uuid4())
    supabase.table("campaigns").insert({
        "id": campaign_id,
        "user_id": user.id,
        "name": name,
        "status": "processing",
        "total_leads": len(leads),
        "csv_filename": file.filename,
    }).execute()

    # Insert leads
    lead_records = []
    for lead in leads:
        lead_records.append({
            "campaign_id": campaign_id,
            "user_id": user.id,
            "first_name": lead.get("first_name", ""),
            "last_name": lead.get("last_name", ""),
            "email": lead.get("email", ""),
            "company": lead.get("company", ""),
            "title": lead.get("title", ""),
            "linkedin_url": lead.get("linkedin_url", ""),
        })

    if lead_records:
        supabase.table("leads").insert(lead_records).execute()

    # Trigger 5-agent pipeline as a background task
    background_tasks.add_task(process_campaign, campaign_id, user.id)

    return {"campaign_id": campaign_id, "leads_count": len(leads), "status": "processing"}

@router.put("/{campaign_id}/status")
async def update_campaign_status(campaign_id: str, status: str, authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()
    supabase.table("campaigns").update({"status": status}).eq("id", campaign_id).eq("user_id", user.id).execute()
    return {"message": f"Campaign status updated to {status}"}
