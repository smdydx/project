
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.services.dashboard_service import DashboardService
from backend.schemas.dashboard import (
    DashboardStatsResponse,
    ChartDataResponse,
    LiveTransactionResponse,
    RecentUserResponse
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get comprehensive dashboard statistics including:
    - Total users, new signups
    - KYC verification stats
    - Prime user count
    - LCR money and rewards
    - Recharge counts
    """
    try:
        stats = DashboardService.get_dashboard_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/charts", response_model=ChartDataResponse)
async def get_chart_data(db: Session = Depends(get_db)):
    """
    Get chart data for:
    - Daily transaction volume (last 7 days)
    - Service distribution by category
    """
    try:
        charts = DashboardService.get_chart_data(db)
        return charts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching charts: {str(e)}")

@router.get("/transactions/live", response_model=List[LiveTransactionResponse])
async def get_live_transactions(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get latest live transactions"""
    try:
        transactions = DashboardService.get_live_transactions(db, limit)
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")

@router.get("/users/recent", response_model=List[RecentUserResponse])
async def get_recent_users(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recently registered users"""
    try:
        users = DashboardService.get_recent_users(db, limit)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")
