from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from core.config import settings
from core.database import engine
from core.base import Base

# Import all models to register them with Base
import models

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Admin Dashboard API for comprehensive platform management"
)

# Configure CORS with explicit settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "https://*.replit.dev",
        "https://*.repl.co",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

# Create upload directory if not exists
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_FOLDER), name="uploads")

# Include API routes
from api.v1 import auth, users, dashboard, test, transactions, websocket, kyc, auto_crud, payment_gateway
from api.v1.auto_crud import create_auto_crud_routers, get_models_list

app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(kyc.router, prefix="/api/v1/kyc", tags=["kyc"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(test.router, prefix="/api/v1/test", tags=["test"])
app.include_router(websocket.router, tags=["websocket"])

# Auto-generate CRUD endpoints for all models
crud_routers = create_auto_crud_routers()
for router, name, prefix in crud_routers:
    app.include_router(router, prefix=f"/api/crud{prefix}", tags=["Auto CRUD", name])

app.include_router(payment_gateway.router, prefix="/api/v1/payment-gateway", tags=["payment-gateway"])

@app.get("/")
async def root():
    return {
        "message": "Admin Dashboard API",
        "version": settings.VERSION,
        "docs": "/docs",
        "models": get_models_list()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "api_version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)