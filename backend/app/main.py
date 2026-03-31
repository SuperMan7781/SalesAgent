# s:\Dev\Work\SalesAgent\backend\app\main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.routers import campaigns, leads, auth, analytics
from typing import Dict, Set
import json

app = FastAPI(
    title="Autonomous SDR API",
    description="Hyper-Contextual AI Sales Development Representative",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",  # Allow all origins for showcase with credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


# ============================================
# WebSocket Connection Manager
# ============================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, campaign_id: str):
        await websocket.accept()
        if campaign_id not in self.active_connections:
            self.active_connections[campaign_id] = set()
        self.active_connections[campaign_id].add(websocket)

    def disconnect(self, websocket: WebSocket, campaign_id: str):
        if campaign_id in self.active_connections:
            self.active_connections[campaign_id].discard(websocket)

    async def broadcast(self, campaign_id: str, message: dict):
        if campaign_id in self.active_connections:
            for connection in self.active_connections[campaign_id].copy():
                try:
                    await connection.send_json(message)
                except Exception:
                    self.active_connections[campaign_id].discard(connection)


manager = ConnectionManager()


@app.websocket("/ws/campaign/{campaign_id}")
async def websocket_endpoint(websocket: WebSocket, campaign_id: str):
    await manager.connect(websocket, campaign_id)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket, campaign_id)


@app.get("/")
async def read_root():
    return {
        "message": "Welcome to Autonomous SDR API",
        "status": "online",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
