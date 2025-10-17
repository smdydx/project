from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from core.config import settings
from core.database import engine
from core.base import Base

# Import all models to register them with Base
from models import (
    auto_loan, banner, business_loan, device, home_loan,
    loan_against_property, machine_loan, models, payment_gateway,
    personal_loan, private_funding, service_job_log,
    service_registration, service_request, setting
)

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Admin Dashboard API for comprehensive platform management"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create upload directory if not exists
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_FOLDER), name="uploads")

# Include API routes
from api.v1 import dashboard, users, kyc, test, transactions, websocket
from api.v1.auto_crud import create_auto_crud_routers, get_models_list

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