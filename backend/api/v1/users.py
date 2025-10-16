
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.models import User
from sqlalchemy import desc, or_, func
from datetime import datetime, timedelta

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
        
        # Apply filters if provided
        if user_type and user_type.lower() != 'all':
            if user_type.lower() == 'prime user':
                query = query.filter(User.prime_status == True)
            else:
                query = query.filter(User.prime_status == False)
        
        if status and status.lower() != 'all':
            # Note: You might need to add a status field to User model
            # For now, we'll use activation_status as proxy
            if status.lower() == 'active':
                query = query.filter(User.activation_status == True)
            elif status.lower() == 'blocked':
                query = query.filter(User.activation_status == False)
        
        users = query.order_by(desc(User.CreatedAt)).limit(limit).all()
        
        result = []
        for user in users:
            # Calculate wallet balance and transactions from related data
            wallet_balance = float(user.INRWalletBalance) if user.INRWalletBalance else 0
            total_transactions = len(user.transactions) if user.transactions else 0
            
            result.append({
                "id": f"USR{user.UserID}",
                "name": user.fullname or "Unknown",
                "email": user.Email or "",
                "mobile": user.MobileNumber or "",
                "status": "Active" if user.activation_status else "Blocked",
                "userType": "Prime User" if user.prime_status else "Normal User",
                "joinedOn": user.CreatedAt.strftime('%Y-%m-%d') if user.CreatedAt else "",
                "balance": wallet_balance,
                "totalTransactions": total_transactions
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
                "id": f"SUP{user.UserID}",
                "name": user.fullname or "Unknown",
                "email": user.Email or "",
                "mobile": user.MobileNumber or "",
                "city": "Unknown",
                "accountType": "Retailer",
                "signupDate": user.CreatedAt.strftime('%Y-%m-%d') if user.CreatedAt else "",
                "signupTime": user.CreatedAt.strftime('%H:%M:%S') if user.CreatedAt else "",
                "referredBy": user.introducer_id or "Direct",
                "deviceType": "Mobile",
                "kycStatus": "Verified" if user.IsKYCCompleted else "Pending"
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
