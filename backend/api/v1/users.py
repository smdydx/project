from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime

from core.database import get_db
from core.auth import get_current_user, TokenData
from models.models import User
from models.payment_gateway import Payment_Gateway

router = APIRouter(tags=["users"])

@router.get("/all")
async def get_all_users(
    current_user: TokenData = Depends(get_current_user),
    user_type: Optional[str] = Query(None, description="Filter by Prime or Normal"),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get all users with Prime/Normal filter only (NO KYC status column)"""
    try:
        query = db.query(User).filter(User.IsDeleted == False)

        # User Type Filter (Prime or Normal ONLY)
        if user_type and user_type != 'All':
            if user_type == 'Prime' or user_type == 'Prime User':
                query = query.filter(User.prime_status == True)
            elif user_type == 'Normal' or user_type == 'Normal User':
                query = query.filter(User.prime_status == False)

        users = query.order_by(desc(User.CreatedAt)).limit(limit).all()

        # Get all transaction counts in a single query (optimized)
        user_mobiles = [u.MobileNumber for u in users]
        txn_counts_query = db.query(
            Payment_Gateway.payer_mobile,
            func.count(Payment_Gateway.id).label('count')
        ).filter(
            Payment_Gateway.payer_mobile.in_(user_mobiles)
        ).group_by(Payment_Gateway.payer_mobile).all()

        # Create a dictionary for quick lookup
        txn_counts = {mobile: count for mobile, count in txn_counts_query}

        result = []
        for user in users:
            # Get transaction count from dictionary (O(1) lookup)
            txn_count = txn_counts.get(user.MobileNumber, 0)

            result.append({
                "UserID": user.UserID,
                "fullname": user.fullname or f"User {user.UserID}",
                "MobileNumber": user.MobileNumber,
                "Email": user.Email or "N/A",
                "member_id": user.member_id,
                "introducer_id": user.introducer_id,
                "prime_status": user.prime_status,
                "DeviceVerified": user.DeviceVerified,
                "userType": "Prime" if user.prime_status else "Normal",
                "transaction_count": txn_count,
                "INRWalletBalance": float(user.INRWalletBalance) if user.INRWalletBalance else 0,
                "RewardWalletBalance": float(user.RewardWalletBalance) if user.RewardWalletBalance else 0,
                "CreatedAt": user.CreatedAt.isoformat() if user.CreatedAt else None,
                "UpdatedAt": user.UpdatedAt.isoformat() if user.UpdatedAt else None,
                "prime_activation_date": user.prime_activation_date.isoformat() if user.prime_activation_date else None
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/signups")
async def get_new_signups(
    current_user: TokenData = Depends(get_current_user),
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


@router.get("/detail/{user_id}")
async def get_user_detail(
    user_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete user details with PAN and Aadhaar information"""
    try:
        from models.models import User, Aadhar_User, User_Aadhar_Address, PanVerification, PanOfflineKYC, OfflineKYC
        from models.payment_gateway import Payment_Gateway

        # Get user with joins
        user = db.query(User).filter(
            User.UserID == user_id,
            User.IsDeleted == False
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get Aadhaar details
        aadhaar = db.query(Aadhar_User).join(
            User_Aadhar_Address,
            Aadhar_User.address_id == User_Aadhar_Address.id,
            isouter=True
        ).filter(Aadhar_User.user_id == user_id).first()

        # Get PAN details
        pan = db.query(PanVerification).filter(
            PanVerification.user_id == user_id
        ).first()

        # Get PAN image from offline KYC
        pan_image = None
        offline_kyc = db.query(OfflineKYC).filter(
            OfflineKYC.user_id == user_id
        ).first()

        if offline_kyc:
            pan_offline = db.query(PanOfflineKYC).filter(
                PanOfflineKYC.offline_kyc_id == offline_kyc.id
            ).first()
            if pan_offline:
                pan_image = pan_offline.pan_front

        # Get transaction counts
        total_txns = db.query(func.count(Payment_Gateway.id)).filter(
            Payment_Gateway.payer_mobile == user.MobileNumber
        ).scalar() or 0

        result = {
            # Basic Info
            "UserID": user.UserID,
            "fullname": user.fullname or f"User {user.UserID}",
            "MobileNumber": user.MobileNumber,
            "Email": user.Email or "N/A",
            "member_id": user.member_id,
            "introducer_id": user.introducer_id,

            # Wallet & Balance
            "INRWalletBalance": float(user.INRWalletBalance) if user.INRWalletBalance else 0,
            "RewardWalletBalance": float(user.RewardWalletBalance) if user.RewardWalletBalance else 0,
            "total_packages": float(user.total_packages) if user.total_packages else 0,

            # Status
            "activation_status": user.activation_status,
            "prime_status": user.prime_status,
            "DeviceVerified": user.DeviceVerified,
            "IsKYCCompleted": user.IsKYCCompleted,

            # Verification Status
            "aadhar_verification_status": bool(user.aadhar_verification_status),
            "pan_verification_status": bool(user.pan_verification_status),
            "email_verification_status": user.email_verification_status,

            # Dates
            "CreatedAt": user.CreatedAt.isoformat() if user.CreatedAt else None,
            "prime_activation_date": user.prime_activation_date.isoformat() if user.prime_activation_date else None,

            # Transaction Summary
            "totalTransactions": total_txns,
            "totalRecharges": 0,  # Can be calculated from specific tables
            "totalWithdrawals": 0  # Can be calculated from withdrawal_history
        }

        # Add Aadhaar details if available
        if aadhaar:
            result["aadhaar"] = {
                "name": aadhaar.name,
                "aadharNumber": aadhaar.aadharNumber,
                "maskedNumber": aadhaar.maskedNumber,
                "dateOfBirth": aadhaar.dateOfBirth.strftime('%Y-%m-%d') if aadhaar.dateOfBirth else None,
                "gender": aadhaar.gender,
                "phone": aadhaar.phone,
                "email": aadhaar.email,
                "photo": aadhaar.photo,
                "address": {
                    "house": aadhaar.address.house if aadhaar.address else "",
                    "street": aadhaar.address.street if aadhaar.address else "",
                    "locality": aadhaar.address.locality if aadhaar.address else "",
                    "district": aadhaar.address.district if aadhaar.address else "",
                    "state": aadhaar.address.state if aadhaar.address else "",
                    "pin": aadhaar.address.pin if aadhaar.address else "",
                    "country": aadhaar.address.country if aadhaar.address else "India"
                } if aadhaar.address else None
            }

        # Add PAN details if available
        if pan:
            result["pan"] = {
                "pan_number": pan.pan_number,
                "pan_holder_name": pan.pan_holder_name,
                "status": pan.status,
                "category": pan.category,
                "date_of_issue": pan.date_of_issue.strftime('%Y-%m-%d') if pan.date_of_issue else None,
                "pan_image": pan_image  # Base64 image
            }

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))