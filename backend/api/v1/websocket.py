
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
    print(f"WebSocket client connected. Total connections: {len(manager.active_connections)}")
    
    try:
        while True:
            # Send dashboard stats
            stats = DashboardService.get_dashboard_stats(db)
            await websocket.send_json({
                "type": "data",
                "channel": "dashboard-stats",
                "data": stats,
                "timestamp": datetime.now().isoformat()
            })
            
            # Send recent transaction
            transactions = DashboardService.get_live_transactions(db, 1)
            if transactions:
                await websocket.send_json({
                    "type": "data",
                    "channel": "transactions",
                    "data": transactions[0],
                    "timestamp": datetime.now().isoformat()
                })
            
            # Send recent user
            users = DashboardService.get_recent_users(db, 1)
            if users:
                await websocket.send_json({
                    "type": "data",
                    "channel": "user-registrations",
                    "data": users[0],
                    "timestamp": datetime.now().isoformat()
                })
            
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"WebSocket client disconnected. Total connections: {len(manager.active_connections)}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
