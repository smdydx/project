from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime

from core.database import get_db
from models.models import User
from models.payment_gateway import Payment_Gateway

router = APIRouter(tags=["users"])

@router.get("/all")
async def get_all_users(
    user_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get all users with filters"""
    try:
        query = db.query(User).filter(User.IsDeleted == False)

        if user_type and user_type != 'All':
            if user_type == 'Prime User':
                query = query.filter(User.prime_status == True)
            elif user_type == 'Normal User':
                query = query.filter(User.prime_status == False)

        if status and status != 'All':
            if status == 'Active':
                query = query.filter(User.activation_status == True)
            elif status == 'Blocked':
                query = query.filter(User.activation_status == False)

        users = query.order_by(desc(User.CreatedAt)).limit(limit).all()

        result = []
        for user in users:
            # Get transaction count for this user
            txn_count = db.query(func.count(Payment_Gateway.id)).filter(
                Payment_Gateway.payer_mobile == user.MobileNumber
            ).scalar() or 0

            result.append({
                "id": str(user.UserID),
                "name": user.fullname or f"User {user.UserID}",
                "email": user.Email or "N/A",
                "mobile": user.MobileNumber,
                "userType": "Prime User" if user.prime_status else "Normal User",
                "balance": float(user.INRWalletBalance) if user.INRWalletBalance else 0,
                "totalTransactions": txn_count,
                "status": "Active" if user.activation_status else "Blocked"
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/signups")
async def get_new_signups(
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get new user signups"""
    try:
        users = db.query(User).filter(
            User.IsDeleted == False
        ).order_by(desc(User.CreatedAt)).limit(limit).all()

        result = []
        for user in users:
            result.append({
                "id": f"SUP{user.UserID:06d}",
                "name": user.fullname or f"User {user.UserID}",
                "email": user.Email or "N/A",
                "mobile": user.MobileNumber,
                "userId": str(user.UserID),
                "city": "Unknown",
                "accountType": "Prime" if user.prime_status else "Retailer",
                "signupDate": user.CreatedAt.strftime('%Y-%m-%d') if user.CreatedAt else "",
                "signupTime": user.CreatedAt.strftime('%H:%M:%S') if user.CreatedAt else "",
                "referredBy": user.introducer_id or "Direct",
                "deviceType": "Android"
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))