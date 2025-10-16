from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
)

# Include API routes
from api.v1 import dashboard, kyc, users, transactions

app.include_router(
    dashboard.router,
    prefix=f"{settings.API_V1_PREFIX}/dashboard",
    tags=["dashboard"]
)
app.include_router(kyc.router, prefix=f"{settings.API_V1_PREFIX}/kyc", tags=["kyc"])
app.include_router(users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["users"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_PREFIX}/transactions", tags=["transactions"])

@app.get("/")
async def root():
    return {
        "message": "Admin Dashboard API",
        "version": settings.VERSION,
        "docs": "/docs"
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