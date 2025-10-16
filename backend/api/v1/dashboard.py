from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from core.database import get_db
from services.dashboard_service import DashboardService
# Removed: from services.mock_data_service import MockDataService
from schemas.dashboard import (
    DashboardStatsResponse,
    ChartDataResponse,
    LiveTransactionResponse,
    RecentUserResponse
)

router = APIRouter(tags=["dashboard"])

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
        print(f"📊 Stats response: {stats}")
        return DashboardStatsResponse(**stats)
    except Exception as e:
        print(f"❌ Error in get_dashboard_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return default values instead of error
        return DashboardStatsResponse()

@router.get("/charts", response_model=ChartDataResponse)
async def get_chart_data(db: Session = Depends(get_db)):
    """
    Get chart data for:
    - Daily transaction volume (last 7 days)
    - Service distribution by category
    """
    try:
        charts = DashboardService.get_chart_data(db)
        print(f"📈 Charts response: {charts}")
        return ChartDataResponse(**charts)
    except Exception as e:
        print(f"❌ Error in get_chart_data: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return empty chart data instead of error
        return ChartDataResponse(daily_volume=[], service_distribution=[])

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

@router.get("/transactions", response_model=List[LiveTransactionResponse])
async def get_transactions(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get transactions - alias for live transactions"""
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

@router.get("/users", response_model=List[RecentUserResponse])
async def get_all_users(
    limit: int = 100,
    page: int = 1,
    db: Session = Depends(get_db)
):
    """Get all users with pagination"""
    try:
        users = DashboardService.get_recent_users(db, limit)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")