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
    """Get KYC verification data with PAN and Aadhaar joins"""
    try:
        from models.models import Aadhar_User, User_Aadhar_Address
        
        # Join User with OfflineKYC, PanOfflineKYC, Aadhar_User, and User_Aadhar_Address
        query = db.query(User, OfflineKYC, PanOfflineKYC, Aadhar_User, User_Aadhar_Address).outerjoin(
            OfflineKYC, User.UserID == OfflineKYC.user_id
        ).outerjoin(
            PanOfflineKYC, OfflineKYC.id == PanOfflineKYC.offline_kyc_id
        ).outerjoin(
            Aadhar_User, User.UserID == Aadhar_User.user_id
        ).outerjoin(
            User_Aadhar_Address, Aadhar_User.address_id == User_Aadhar_Address.id
        ).filter(User.IsDeleted == False)

        if status:
            if status.lower() == 'verified':
                # Both Aadhaar and PAN verified
                query = query.filter(
                    User.aadhar_verification_status == True,
                    User.pan_verification_status == True
                )
            elif status.lower() == 'partially verified':
                # Only one verified (either Aadhaar OR PAN, but not both)
                query = query.filter(
                    (User.aadhar_verification_status == True) | (User.pan_verification_status == True)
                ).filter(
                    ~((User.aadhar_verification_status == True) & (User.pan_verification_status == True))
                )
            elif status.lower() == 'not verified':
                # Neither Aadhaar nor PAN verified
                query = query.filter(
                    User.aadhar_verification_status == False,
                    User.pan_verification_status == False
                )

        results = query.order_by(desc(User.CreatedAt)).limit(limit).all()

        kyc_data = []
        for user, kyc, pan_data, aadhaar, address in results:
            # Determine KYC/Verification status
            aadhaar_verified = user.aadhar_verification_status or False
            pan_verified = user.pan_verification_status or False
            
            if aadhaar_verified and pan_verified:
                kyc_status = 'Verified'
            elif aadhaar_verified or pan_verified:
                kyc_status = 'Partially Verified'
            else:
                kyc_status = 'Not Verified'

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

            kyc_record = {
                "id": f"KYC{user.UserID:06d}",
                "name": user.fullname or f"User {user.UserID}",
                "userId": str(user.UserID),
                "mobile": user.MobileNumber,
                "email": user.Email or "N/A",
                "documentType": "Aadhaar" if kyc else "N/A",
                "documentNumber": kyc.aadhar_no if kyc else (aadhaar.aadharNumber if aadhaar else "N/A"),
                "submittedOn": kyc.dob.strftime('%Y-%m-%d') if kyc and kyc.dob else user.CreatedAt.strftime('%Y-%m-%d') if user.CreatedAt else "",
                "submittedTime": user.CreatedAt.strftime('%H:%M:%S') if user.CreatedAt else "",
                "kycStatus": kyc_status,
                "verifiedBy": "Admin" if user.IsKYCCompleted else "",
                "aadhaarFront": f"/backend/uploads/{kyc.aadhar_front_filename}" if kyc and kyc.aadhar_front_filename else None,
                "aadhaarBack": f"/backend/uploads/{kyc.aadhar_back_filename}" if kyc and kyc.aadhar_back_filename else None,
                "panImage": f"/backend/uploads/{pan_data.pan_front}" if pan_data and pan_data.pan_front else None,
                "panNumber": pan_data.pan_no if pan_data else None,
                "panName": pan_data.pan_name if pan_data else None
            }
            
            # Add Aadhaar details from Aadhar_User table if available
            if aadhaar:
                kyc_record["aadhaarDetails"] = {
                    "name": aadhaar.name,
                    "aadharNumber": aadhaar.aadharNumber,
                    "maskedNumber": aadhaar.maskedNumber,
                    "dateOfBirth": aadhaar.dateOfBirth.strftime('%Y-%m-%d') if aadhaar.dateOfBirth else None,
                    "gender": aadhaar.gender,
                    "phone": aadhaar.phone,
                    "email": aadhaar.email,
                    "photo": aadhaar.photo
                }
                
                # Add address if available
                if address:
                    kyc_record["aadhaarDetails"]["address"] = {
                        "house": address.house,
                        "street": address.street,
                        "locality": address.locality,
                        "district": address.district,
                        "state": address.state,
                        "pin": address.pin,
                        "country": address.country or "India"
                    }
            
            kyc_data.append(kyc_record)

        return kyc_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))