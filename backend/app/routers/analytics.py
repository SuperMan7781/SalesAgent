# s:\Dev\Work\SalesAgent\backend\app\routers\analytics.py
from fastapi import APIRouter, Header
from app.database import get_supabase_client
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()

    campaigns = supabase.table("campaigns").select("*").eq("user_id", user.id).execute()

    total_sent = sum(c.get("sent_count", 0) for c in campaigns.data)
    total_replies = sum(c.get("replied_count", 0) for c in campaigns.data)
    total_meetings = sum(c.get("meetings_booked", 0) for c in campaigns.data)
    reply_rate = (total_replies / total_sent * 100) if total_sent > 0 else 0

    return {
        "total_campaigns": len(campaigns.data),
        "total_sent": total_sent,
        "total_replies": total_replies,
        "total_meetings": total_meetings,
        "reply_rate": round(reply_rate, 1),
        "campaigns": campaigns.data,
    }

@router.get("/campaign/{campaign_id}")
async def get_campaign_stats(campaign_id: str, authorization: str = Header(...)):
    user = await get_current_user(authorization)
    supabase = get_supabase_client()

    campaign = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user.id).single().execute()

    leads = supabase.table("leads").select("review_status, send_status, qualification_status, lead_quality").eq("campaign_id", campaign_id).eq("user_id", user.id).execute()

    # Aggregate lead breakdowns
    review_breakdown = {}
    send_breakdown = {}
    quality_breakdown = {}

    for lead in leads.data:
        rs = lead.get("review_status", "unknown")
        ss = lead.get("send_status", "unknown")
        lq = lead.get("lead_quality", "unknown")
        review_breakdown[rs] = review_breakdown.get(rs, 0) + 1
        send_breakdown[ss] = send_breakdown.get(ss, 0) + 1
        quality_breakdown[lq] = quality_breakdown.get(lq, 0) + 1

    return {
        "campaign": campaign.data,
        "review_breakdown": review_breakdown,
        "send_breakdown": send_breakdown,
        "quality_breakdown": quality_breakdown,
    }
