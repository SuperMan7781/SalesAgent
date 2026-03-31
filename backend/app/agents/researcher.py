# s:\Dev\Work\SalesAgent\backend\app\agents\researcher.py
from app.services.apollo import ApolloClient
from app.services.proxycurl import ProxycurlClient
from app.services.exa import ExaClient
from typing import Dict
import asyncio

async def research_lead(lead: Dict) -> Dict:
    """
    Agent 1: Deep-dive enrichment across multiple sources.
    Input: Raw lead data (name, email, company, linkedin_url)
    Output: Structured research dossier (JSON)
    """
    apollo = ApolloClient()
    proxycurl = ProxycurlClient()
    exa = ExaClient()

    # Run all enrichment calls in parallel
    tasks = []

    # Apollo person enrichment
    tasks.append(apollo.enrich_person(
        email=lead.get("email"),
        linkedin_url=lead.get("linkedin_url")
    ))

    # Proxycurl LinkedIn profile (only if URL provided)
    if lead.get("linkedin_url"):
        tasks.append(proxycurl.get_linkedin_profile(lead["linkedin_url"]))
    else:
        async def skip_proxycurl():
            return {"source": "proxycurl", "skipped": True}
        tasks.append(skip_proxycurl())

    # Exa news search
    company = lead.get("company", "")
    if company:
        tasks.append(exa.search_company_news(company))
    else:
        async def skip_exa():
            return {"source": "exa_news", "skipped": True}
        tasks.append(skip_exa())

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Compile dossier
    dossier = {
        "lead_name": f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip(),
        "lead_email": lead.get("email", ""),
        "lead_company": lead.get("company", ""),
        "apollo_data": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
        "linkedin_data": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
        "news_data": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
    }

    # Calculate lead quality
    data_points = 0
    if not dossier["apollo_data"].get("error") and not dossier["apollo_data"].get("skipped"):
        data_points += 2
    if not dossier["linkedin_data"].get("error") and not dossier["linkedin_data"].get("skipped"):
        data_points += 2
    if not dossier["news_data"].get("error") and not dossier["news_data"].get("skipped"):
        data_points += 1

    if data_points >= 4:
        dossier["lead_quality"] = "rich"
    elif data_points >= 2:
        dossier["lead_quality"] = "partial"
    else:
        dossier["lead_quality"] = "thin"

    return dossier
