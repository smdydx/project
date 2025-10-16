from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from services.dashboard_service import DashboardService
import json
import asyncio
from datetime import datetime
import random # Added for random data generation

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print(f"WebSocket client connected. Total connections: {len(manager.active_connections)}")

    try:
        # Get a fresh database session for this connection
        from core.database import SessionLocal
        db = SessionLocal()

        while True:
            try:
                # Send dashboard stats
                stats = DashboardService.get_dashboard_stats(db)
                await manager.send_personal_message({
                    "type": "data",
                    "channel": "dashboard-stats",
                    "data": stats,
                    "timestamp": datetime.now().isoformat()
                }, websocket)

                # Send recent transaction
                transactions = DashboardService.get_live_transactions(db, 1)
                if transactions:
                    await manager.send_personal_message({
                        "type": "data",
                        "channel": "transactions",
                        "data": transactions[0],
                        "timestamp": datetime.now().isoformat()
                    }, websocket)

                # Send recent user
                users = DashboardService.get_recent_users(db, 1)
                if users:
                    await manager.send_personal_message({
                        "type": "data",
                        "channel": "user-registrations",
                        "data": users[0],
                        "timestamp": datetime.now().isoformat()
                    }, websocket)
            except Exception as e:
                print(f"Error sending data: {e}")
                # Optionally, break the loop or handle specific errors
                # For now, we'll just log and continue to allow for potential recovery

            await asyncio.sleep(3) # Adjusted sleep interval
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"WebSocket client disconnected. Total connections: {len(manager.active_connections)}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket) # Ensure disconnect on other errors
    finally:
        if 'db' in locals() and db:
            db.close()