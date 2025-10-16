
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.models import OfflineKYC, PanOfflineKYC, User
from sqlalchemy import desc, or_
from datetime import datetime

router = APIRouter(tags=["kyc"])

@router.get("/verification")
async def get_kyc_verifications(
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get KYC verification records"""
    try:
        query = db.query(OfflineKYC).join(User, OfflineKYC.user_id == User.UserID)
        
        if status and status.lower() != 'all':
            query = query.filter(OfflineKYC.status == status.lower())
        
        kyc_records = query.order_by(desc(OfflineKYC.id)).limit(limit).all()
        
        result = []
        for kyc in kyc_records:
            user = kyc.user
            pan_kyc = db.query(PanOfflineKYC).filter(
                PanOfflineKYC.offline_kyc_id == kyc.id
            ).first()
            
            result.append({
                "id": f"KYC{kyc.id}",
                "userId": f"USR{user.UserID}",
                "name": kyc.name or user.fullname or "Unknown",
                "email": user.Email or "",
                "mobile": user.MobileNumber or "",
                "kycStatus": kyc.status.capitalize() if kyc.status else "Pending",
                "documentType": "Aadhaar Card",
                "documentNumber": kyc.aadhar_no or "",
                "submittedOn": kyc.id,
                "submittedTime": "",
                "verifiedBy": None,
                "remarks": None,
                "panNumber": pan_kyc.pan_no if pan_kyc else None,
                "panStatus": pan_kyc.status if pan_kyc else None
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
