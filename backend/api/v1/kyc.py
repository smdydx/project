from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from core.database import get_db
from models.models import User, OfflineKYC

router = APIRouter(tags=["kyc"])

@router.get("/verification")
async def get_kyc_verification(
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get KYC verification data"""
    try:
        query = db.query(User, OfflineKYC).outerjoin(
            OfflineKYC, User.UserID == OfflineKYC.user_id
        ).filter(User.IsDeleted == False)

        if status and status.lower() != 'all':
            if status.lower() == 'verified':
                query = query.filter(User.IsKYCCompleted == True)
            elif status.lower() == 'pending':
                query = query.filter(User.IsKYCCompleted == False)
            elif status.lower() == 'rejected':
                query = query.filter(OfflineKYC.status == 'rejected')

        results = query.order_by(desc(User.CreatedAt)).limit(limit).all()

        kyc_data = []
        for user, kyc in results:
            # Determine KYC status
            kyc_status = 'Verified' if user.IsKYCCompleted else 'Pending'
            if kyc and kyc.status == 'rejected':
                kyc_status = 'Rejected'

            kyc_data.append({
                "id": f"KYC{user.UserID:06d}",
                "name": user.fullname or f"User {user.UserID}",
                "userId": str(user.UserID),
                "mobile": user.MobileNumber,
                "email": user.Email or "N/A",
                "documentType": "Aadhaar" if kyc else "N/A",
                "documentNumber": kyc.aadhar_no if kyc else "N/A",
                "submittedOn": kyc.dob.strftime('%Y-%m-%d') if kyc and kyc.dob else user.CreatedAt.strftime('%Y-%m-%d') if user.CreatedAt else "",
                "submittedTime": user.CreatedAt.strftime('%H:%M:%S') if user.CreatedAt else "",
                "kycStatus": kyc_status,
                "verifiedBy": "Admin" if user.IsKYCCompleted else ""
            })

        return kyc_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))