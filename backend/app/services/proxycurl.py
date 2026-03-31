# s:\Dev\Work\SalesAgent\backend\app\services\proxycurl.py
import httpx
from app.config import get_settings
from typing import Dict

class ProxycurlClient:
    BASE_URL = "https://nubela.co/proxycurl/api"
    
    def __init__(self):
        self.api_key = get_settings().PROXYCURL_API_KEY
    
    async def get_linkedin_profile(self, linkedin_url: str) -> Dict:
        """Get detailed LinkedIn profile data."""
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/v2/linkedin",
                    params={"linkedin_profile_url": linkedin_url, "use_cache": "if-present"},
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "source": "proxycurl",
                    "full_name": data.get("full_name", ""),
                    "headline": data.get("headline", ""),
                    "summary": data.get("summary", ""),
                    "city": data.get("city", ""),
                    "country_full_name": data.get("country_full_name", ""),
                    "current_company": data.get("experiences", [{}])[0].get("company", "") if data.get("experiences") else "",
                    "current_role": data.get("experiences", [{}])[0].get("title", "") if data.get("experiences") else "",
                    "role_start_date": data.get("experiences", [{}])[0].get("starts_at", {}) if data.get("experiences") else {},
                    "recent_posts": [p.get("title", "") for p in (data.get("activities", []) or [])[:3]],
                    "education": [e.get("school", "") for e in (data.get("education", []) or [])[:2]],
                    "connections": data.get("connections", 0),
                    "follower_count": data.get("follower_count", 0),
                }
            except Exception as e:
                return {"source": "proxycurl", "error": str(e)}