from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from services.dashboard_service import DashboardService
from schemas.dashboard import (
    DashboardStatsResponse,
    ChartDataResponse,
    LiveTransactionResponse,
    RecentUserResponse
)

router = APIRouter(tags=["dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get comprehensive dashboard statistics"""
    stats = DashboardService.get_dashboard_stats(db)
    return DashboardStatsResponse(**stats)

@router.get("/charts", response_model=ChartDataResponse)
async def get_chart_data(db: Session = Depends(get_db)):
    """Get chart data for daily volume and service distribution"""
    charts = DashboardService.get_chart_data(db)
    return ChartDataResponse(**charts)

@router.get("/transactions", response_model=List[LiveTransactionResponse])
async def get_transactions(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get transactions"""
    transactions = DashboardService.get_live_transactions(db, limit)
    return transactions

@router.get("/users/recent", response_model=List[RecentUserResponse])
async def get_recent_users(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get recently registered users"""
    users = DashboardService.get_recent_users(db, limit)
    return users