
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.models import User
from sqlalchemy import desc, or_, func
from datetime import datetime, timedelta

router = APIRouter(tags=["users"])

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
