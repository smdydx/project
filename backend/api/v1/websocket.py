
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from services.dashboard_service import DashboardService
import json
import asyncio
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            # Send dashboard stats every 3 seconds
            stats = DashboardService.get_dashboard_stats(db)
            await websocket.send_json({
                "type": "dashboard-stats",
                "data": stats
            })
            
            # Send recent transaction
            transactions = DashboardService.get_live_transactions(db, 1)
            if transactions:
                await websocket.send_json({
                    "type": "transactions",
                    "data": transactions[0]
                })
            
            # Send recent user
            users = DashboardService.get_recent_users(db, 1)
            if users:
                await websocket.send_json({
                    "type": "user-registrations",
                    "data": users[0]
                })
            
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
