from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from services.dashboard_service import DashboardService
import json
import asyncio
from datetime import datetime

router = APIRouter()

# Store active WebSocket connections
active_connections: list[WebSocket] = []

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    active_connections.append(websocket)
    print(f"WebSocket client connected. Total connections: {len(active_connections)}")
    
    try:
        # Send initial data immediately
        stats = DashboardService.get_dashboard_stats(db)
        await websocket.send_json({
            "type": "data",
            "channel": "dashboard-stats",
            "data": stats,
            "timestamp": datetime.now().isoformat()
        })
        
        # Start broadcasting loop
        while True:
            try:
                # Broadcast dashboard stats every 5 seconds
                stats = DashboardService.get_dashboard_stats(db)
                await websocket.send_json({
                    "type": "data",
                    "channel": "dashboard-stats",
                    "data": stats,
                    "timestamp": datetime.now().isoformat()
                })
                
                # Broadcast latest transaction
                transactions = DashboardService.get_live_transactions(db, limit=1)
                if transactions:
                    await websocket.send_json({
                        "type": "data",
                        "channel": "transactions",
                        "data": transactions[0],
                        "timestamp": datetime.now().isoformat()
                    })
                
                # Broadcast latest user registration
                users = DashboardService.get_recent_users(db, limit=1)
                if users:
                    await websocket.send_json({
                        "type": "data",
                        "channel": "user-registrations",
                        "data": users[0],
                        "timestamp": datetime.now().isoformat()
                    })
                
                await asyncio.sleep(5)
                
            except Exception as e:
                print(f"Error broadcasting data: {e}")
                break
                
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"WebSocket client disconnected. Total connections: {len(active_connections)}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

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
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except RuntimeError as e:
                if "Cannot call" in str(e):
                    disconnected.append(connection)
            except Exception as e:
                print(f"Error sending data: {e}")
                disconnected.append(connection)

        # Clean up disconnected connections
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print(f"WebSocket client connected. Total connections: {len(manager.active_connections)}")

    try:
        while True:
            try:
                data = await websocket.receive_text()
                # Handle incoming messages if needed
            except RuntimeError as e:
                if "Cannot call" in str(e):
                    break
                raise
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)
        print(f"WebSocket client disconnected. Total connections: {len(manager.active_connections)}")

    # Create fresh DB session for each iteration
    from core.database import SessionLocal
    db = SessionLocal()

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
    finally:
        # Always close the session after each iteration
        db.close()

    await asyncio.sleep(5)