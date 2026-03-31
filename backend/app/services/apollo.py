# s:\Dev\Work\SalesAgent\backend\app\services\apollo.py
import httpx
from app.config import get_settings
from typing import Dict, Optional

class ApolloClient:
    BASE_URL = "https://api.apollo.io/v1"
    
    def __init__(self):
        self.api_key = get_settings().APOLLO_API_KEY
    
    async def enrich_person(self, email: str = None, linkedin_url: str = None) -> Dict:
        """Enrich a person using Apollo.io People Enrichment API."""
        async with httpx.AsyncClient(timeout=30) as client:
            params = {"api_key": self.api_key}
            if email:
                params["email"] = email
            if linkedin_url:
                params["linkedin_url"] = linkedin_url
            
            try:
                response = await client.post(
                    f"{self.BASE_URL}/people/match",
                    json=params
                )
                response.raise_for_status()
                data = response.json().get("person", {})
                
                return {
                    "source": "apollo",
                    "name": data.get("name", ""),
                    "title": data.get("title", ""),
                    "company": data.get("organization", {}).get("name", ""),
                    "company_size": data.get("organization", {}).get("estimated_num_employees", ""),
                    "industry": data.get("organization", {}).get("industry", ""),
                    "company_revenue": data.get("organization", {}).get("annual_revenue_printed", ""),
                    "technologies": data.get("organization", {}).get("current_technologies", []),
                    "seniority": data.get("seniority", ""),
                    "departments": data.get("departments", []),
                    "city": data.get("city", ""),
                    "country": data.get("country", ""),
                    "linkedin_url": data.get("linkedin_url", ""),
                    "headline": data.get("headline", ""),
                    "employment_history": data.get("employment_history", [])[:3],
                }
            except Exception as e:
                return {"source": "apollo", "error": str(e)}
    
    async def search_jobs(self, company_domain: str) -> Dict:
        """Find active job postings for hiring signals."""
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/mixed_people/search",
                    json={
                        "api_key": self.api_key,
                        "q_organization_domains": company_domain,
                        "page": 1,
                        "per_page": 5,
                    }
                )
                response.raise_for_status()
                return {
                    "source": "apollo_jobs",
                    "open_positions": response.json().get("pagination", {}).get("total_entries", 0),
                }
            except Exception as e:
                return {"source": "apollo_jobs", "error": str(e)}