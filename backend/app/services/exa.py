# s:\Dev\Work\SalesAgent\backend\app\services\exa.py
import httpx
from app.config import get_settings
from typing import Dict, List

class ExaClient:
    BASE_URL = "https://api.exa.ai"
    
    def __init__(self):
        self.api_key = get_settings().EXA_API_KEY
    
    async def search_company_news(self, company_name: str) -> Dict:
        """Search for recent news about a company."""
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/search",
                    json={
                        "query": f"{company_name} funding OR launch OR announcement OR partnership",
                        "num_results": 5,
                        "use_autoprompt": True,
                        "type": "neural",
                        "start_published_date": "2025-01-01",  # Recent news only
                    },
                    headers={"x-api-key": self.api_key}
                )
                response.raise_for_status()
                results = response.json().get("results", [])
                
                return {
                    "source": "exa_news",
                    "articles": [
                        {
                            "title": r.get("title", ""),
                            "url": r.get("url", ""),
                            "published_date": r.get("published_date", ""),
                            "snippet": r.get("text", "")[:200] if r.get("text") else "",
                        }
                        for r in results[:3]
                    ],
                }
            except Exception as e:
                return {"source": "exa_news", "error": str(e)}
    
    async def search_company_website(self, company_domain: str) -> Dict:
        """Get company website content for product/messaging analysis."""
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/search",
                    json={
                        "query": f"site:{company_domain}",
                        "num_results": 3,
                        "type": "keyword",
                    },
                    headers={"x-api-key": self.api_key}
                )
                response.raise_for_status()
                results = response.json().get("results", [])
                
                return {
                    "source": "exa_website",
                    "pages": [
                        {"title": r.get("title", ""), "url": r.get("url", "")}
                        for r in results[:3]
                    ],
                }
            except Exception as e:
                return {"source": "exa_website", "error": str(e)}