# s:\Dev\Work\SalesAgent\backend\app\agents\pipeline.py
from app.agents.researcher import research_lead
from app.agents.gatekeeper import qualify_lead
from app.agents.strategist import select_hook
from app.agents.drafter import draft_emails
from app.agents.critic import critique_drafts
from app.database import get_supabase_client
from typing import Dict
import json


async def broadcast_progress(campaign_id: str, data: dict):
    """Broadcast progress to connected WebSocket clients (best-effort)."""
    try:
        from app.main import manager
        await manager.broadcast(campaign_id, data)
    except Exception:
        pass


async def process_single_lead(
    lead: Dict,
    icp: Dict,
    value_proposition: str,
    sender_name: str,
    tone_preset: str = "professional",
    campaign_id: str = None,
) -> Dict:
    """
    Run the full 5-agent pipeline on a single lead.
    Updates the database after each agent step.
    Returns the final processed lead data.
    """
    supabase = get_supabase_client()
    lead_id = lead.get("id")

    # --- Agent 1: Research ---
    supabase.table("leads").update({"enrichment_status": "processing"}).eq("id", lead_id).execute()

    dossier = await research_lead(lead)

    supabase.table("leads").update({
        "research_dossier": json.dumps(dossier),
        "enrichment_status": "completed",
        "lead_quality": dossier.get("lead_quality", "unknown"),
    }).eq("id", lead_id).execute()

    if campaign_id:
        await broadcast_progress(campaign_id, {
            "type": "agent_progress", "lead_id": lead_id,
            "agent": "researcher", "status": "completed",
        })

    # --- Agent 2: Gatekeeper ---
    qualification = await qualify_lead(dossier, icp)

    supabase.table("leads").update({
        "qualification_status": qualification["qualification_status"],
        "qualification_reason": qualification["qualification_reason"],
    }).eq("id", lead_id).execute()

    # If disqualified, stop pipeline
    if qualification["qualification_status"] == "disqualified":
        return {"lead_id": lead_id, "status": "disqualified", "reason": qualification["qualification_reason"]}

    if campaign_id:
        await broadcast_progress(campaign_id, {
            "type": "agent_progress", "lead_id": lead_id,
            "agent": "gatekeeper", "status": "completed",
        })

    # --- Agent 3: Strategist ---
    hook_data = await select_hook(dossier, value_proposition)

    supabase.table("leads").update({
        "selected_hook": hook_data["selected_hook"],
        "hook_reasoning": hook_data["hook_reasoning"],
    }).eq("id", lead_id).execute()

    if campaign_id:
        await broadcast_progress(campaign_id, {
            "type": "agent_progress", "lead_id": lead_id,
            "agent": "strategist", "status": "completed",
        })

    # --- Agent 4: Drafter ---
    drafts = await draft_emails(dossier, hook_data, value_proposition, sender_name, tone_preset)

    supabase.table("leads").update({
        "email_drafts": json.dumps(drafts),
    }).eq("id", lead_id).execute()

    if campaign_id:
        await broadcast_progress(campaign_id, {
            "type": "agent_progress", "lead_id": lead_id,
            "agent": "drafter", "status": "completed",
        })

    # --- Agent 5: Critic ---
    critique = await critique_drafts(dossier, drafts)

    # Find the best approved variant
    best_score = 0
    best_variant = 1
    reviews = critique.get("reviews", [])
    for review in reviews:
        if review.get("approved") and review.get("quality_score", 0) > best_score:
            best_score = review["quality_score"]
            best_variant = review.get("variant", 1)

    avg_quality = sum(r.get("quality_score", 0) for r in reviews) / max(len(reviews), 1)
    avg_spam = sum(r.get("spam_score", 0) for r in reviews) / max(len(reviews), 1)

    supabase.table("leads").update({
        "quality_score": round(avg_quality, 1),
        "spam_score": round(avg_spam, 1),
        "critique_notes": json.dumps(reviews),
        "selected_variant": best_variant,
        "review_status": "pending",  # Ready for human review
    }).eq("id", lead_id).execute()

    if campaign_id:
        await broadcast_progress(campaign_id, {
            "type": "agent_progress", "lead_id": lead_id,
            "agent": "critic", "status": "completed",
        })

    return {
        "lead_id": lead_id,
        "status": "ready_for_review",
        "quality_score": avg_quality,
        "spam_score": avg_spam,
    }


async def process_campaign(campaign_id: str, user_id: str):
    """
    Process all leads in a campaign through the 5-agent pipeline.
    Called as a background task after CSV upload.
    """
    supabase = get_supabase_client()

    # Get user profile for value prop & tone
    profile_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
    icp_res = supabase.table("icp_config").select("*").eq("user_id", user_id).execute()

    profile_data = profile_res.data[0] if profile_res.data else {}
    icp_data = icp_res.data[0] if icp_res.data else {}

    value_proposition = profile_data.get("value_proposition", "AI sales automation")
    sender_name = profile_data.get("full_name", "SalesAgent user")
    tone_preset = profile_data.get("tone_preset", "professional")

    # Get all pending leads
    leads = supabase.table("leads").select("*").eq("campaign_id", campaign_id).eq("enrichment_status", "pending").execute()

    processed = 0
    for lead in leads.data:
        try:
            await process_single_lead(
                lead=lead,
                icp=icp_data,
                value_proposition=value_proposition,
                sender_name=sender_name,
                tone_preset=tone_preset,
                campaign_id=campaign_id,
            )
            processed += 1

            # Update campaign progress
            supabase.table("campaigns").update({
                "processed_leads": processed,
            }).eq("id", campaign_id).execute()

        except Exception as e:
            # Mark lead as failed, continue with next
            supabase.table("leads").update({
                "enrichment_status": "failed",
                "critique_notes": f"Pipeline error: {str(e)}",
            }).eq("id", lead["id"]).execute()

    # Mark campaign as ready
    supabase.table("campaigns").update({
        "status": "ready",
    }).eq("id", campaign_id).execute()

    # Create notification
    supabase.table("notifications").insert({
        "user_id": user_id,
        "type": "success",
        "title": "Campaign Ready for Review",
        "message": f"{processed} leads have been researched and drafted. Review your email queue now.",
        "action_url": f"/campaigns/{campaign_id}/review",
    }).execute()
