from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
import os

from core.database import get_db
from core.config import settings
from models.models import User, OfflineKYC, PanOfflineKYC

router = APIRouter(tags=["kyc"])

@router.get("/verification")
async def get_kyc_verification(
    request: Request,
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

            # Fetch PAN card data if exists
            pan_data = None
            if kyc:
                pan_data = db.query(PanOfflineKYC).filter(
                    PanOfflineKYC.offline_kyc_id == kyc.id
                ).first()

            # Build full image URLs with proper base URL
            base_url = str(request.base_url).rstrip('/')
            
            # Check if files exist and build URLs accordingly
            import os
            aadhaar_front_url = None
            aadhaar_back_url = None
            pan_image_url = None
            
            if kyc and kyc.aadhar_front_filename:
                file_path = os.path.join(settings.UPLOAD_FOLDER, kyc.aadhar_front_filename)
                if os.path.exists(file_path):
                    aadhaar_front_url = f"{base_url}{settings.STATIC_URL_PATH}/{kyc.aadhar_front_filename}"
                    
            if kyc and kyc.aadhar_back_filename:
                file_path = os.path.join(settings.UPLOAD_FOLDER, kyc.aadhar_back_filename)
                if os.path.exists(file_path):
                    aadhaar_back_url = f"{base_url}{settings.STATIC_URL_PATH}/{kyc.aadhar_back_filename}"
                    
            if pan_data and pan_data.pan_front:
                file_path = os.path.join(settings.UPLOAD_FOLDER, pan_data.pan_front)
                if os.path.exists(file_path):
                    pan_image_url = f"{base_url}{settings.STATIC_URL_PATH}/{pan_data.pan_front}"
            
            # Debug logging
            print(f"🖼️ User {user.UserID} - Aadhaar Front: {aadhaar_front_url or 'Not found'}")
            print(f"🖼️ User {user.UserID} - Aadhaar Back: {aadhaar_back_url or 'Not found'}")
            print(f"🖼️ User {user.UserID} - PAN: {pan_image_url or 'Not found'}")
            
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
                "verifiedBy": "Admin" if user.IsKYCCompleted else "",
                "aadhaarFront": aadhaar_front_url,
                "aadhaarBack": aadhaar_back_url,
                "panImage": pan_image_url,
                "panNumber": pan_data.pan_no if pan_data else None,
                "panName": pan_data.pan_name if pan_data else None
            })

        return kyc_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))