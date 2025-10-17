from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from datetime import datetime
from decimal import Decimal

from core.database import get_db
from models.payment_gateway import Payment_Gateway
from models.models import User, LcrMoney, LcrRewards
from models.service_request import Service_Request

router = APIRouter(tags=["transactions"])

@router.get("/mobile")
async def get_mobile_transactions(
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get grouped users list from service_request (excluding pending status)"""
    try:
        # Get distinct users who have transactions (excluding pending)
        from sqlalchemy import func
        
        users_with_txns = db.query(
            Service_Request.user_id,
            func.count(Service_Request.id).label('transaction_count'),
            func.sum(Service_Request.amount).label('total_amount'),
            func.max(Service_Request.created_at).label('last_transaction')
        ).filter(
            Service_Request.status != 'pending'
        ).group_by(Service_Request.user_id).order_by(
            desc('last_transaction')
        ).limit(limit).all()

        result = []
        for user_data in users_with_txns:
            user = db.query(User).filter(User.UserID == user_data.user_id).first()
            
            if user:
                result.append({
                    "id": user.UserID,
                    "userId": user.UserID,
                    "user": user.fullname,
                    "mobile": user.MobileNumber,
                    "memberId": user.member_id,
                    "transactionCount": user_data.transaction_count,
                    "totalAmount": float(user_data.total_amount) if user_data.total_amount else 0,
                    "lastTransaction": user_data.last_transaction.strftime('%Y-%m-%d %H:%M:%S') if user_data.last_transaction else "",
                    "primeStatus": user.prime_status,
                    "kycStatus": "Verified" if user.IsKYCCompleted else "Pending"
                })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dth")
async def get_dth_transactions(
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get DTH recharge transactions"""
    try:
        transactions = db.query(Payment_Gateway).join(
            User, Payment_Gateway.payer_mobile == User.MobileNumber
        ).filter(
            Payment_Gateway.purpose.ilike('%dth%')
        ).order_by(desc(Payment_Gateway.created_at)).limit(limit).all()

        result = []
        for txn in transactions:
            user = db.query(User).filter(User.MobileNumber == txn.payer_mobile).first()
            result.append({
                "id": txn.id,
                "transactionId": f"DTH{txn.id:06d}",
                "user": txn.payer_name or (user.fullname if user else "Unknown"),
                "subscriberId": txn.service_data.get('subscriber_id', f"SUB{txn.id}") if txn.service_data else f"SUB{txn.id}",
                "operator": txn.service_data.get('operator', 'Unknown') if txn.service_data else 'Unknown',
                "plan": txn.service_data.get('plan', 'Standard') if txn.service_data else 'Standard',
                "amount": float(txn.amount) if txn.amount else 0,
                "status": "Success" if txn.status == "success" else "Pending" if txn.status == "pending" else "Failed",
                "date": txn.created_at.strftime('%Y-%m-%d') if txn.created_at else "",
                "time": txn.created_at.strftime('%H:%M:%S') if txn.created_at else "",
                "referenceId": txn.rrn or f"REF{txn.id}"
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/all")
async def get_user_all_transactions(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all transactions for a specific user - Service Requests + LCR Money + LCR Rewards (joined by reference_id)"""
    try:
        # Get user details
        user = db.query(User).filter(User.UserID == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Service Requests (excluding pending)
        service_requests = db.query(Service_Request).filter(
            Service_Request.user_id == user_id,
            Service_Request.status != 'pending'
        ).order_by(desc(Service_Request.created_at)).all()

        # Get all reference_ids for joining
        service_reference_ids = [sr.reference_id for sr in service_requests if sr.reference_id]

        # LCR Bones - joined by reference_id
        lcr_bones = []
        if service_reference_ids:
            lcr_bones = db.query(LcrMoney).filter(
                LcrMoney.reference_id.in_(service_reference_ids)
            ).order_by(desc(LcrMoney.transactiondate)).all()

        # LCR Rewards - joined by reference_id
        lcr_rewards = []
        if service_reference_ids:
            lcr_rewards = db.query(LcrRewards).filter(
                LcrRewards.reference_id.in_(service_reference_ids)
            ).order_by(desc(LcrRewards.transactiondate)).all()

        return {
            "user": {
                "id": user.UserID,
                "name": user.fullname,
                "member_id": user.member_id,
                "mobile": user.MobileNumber
            },
            "service_requests": [
                {
                    "id": sr.id,
                    "reference_id": sr.reference_id,
                    "service_type": sr.service_type,
                    "operator": sr.operator_code or "N/A",
                    "mobile": sr.mobile_number or "N/A",
                    "amount": float(sr.amount),
                    "status": sr.status.capitalize(),
                    "payment_txn_id": sr.payment_txn_id or "N/A",
                    "utr_no": sr.utr_no or "N/A",
                    "date": sr.created_at.strftime('%Y-%m-%d'),
                    "time": sr.created_at.strftime('%H:%M:%S')
                }
                for sr in service_requests
            ],
            "lcr_bones": [
                {
                    "id": lb.srno,
                    "reference_id": lb.reference_id or "N/A",
                    "amount": float(lb.amount) if lb.amount else 0.0,
                    "type": lb.transactiontype or "N/A",
                    "received_by": lb.received_by or "N/A",
                    "received_from": lb.received_from or "N/A",
                    "status": "Active" if lb.status == 1 else "Inactive",
                    "date": lb.transactiondate.strftime('%Y-%m-%d') if lb.transactiondate else "N/A",
                    "time": lb.transactiondate.strftime('%H:%M:%S') if lb.transactiondate else "N/A",
                    "purpose": lb.purpose or "N/A",
                    "remark": lb.remark or "N/A"
                }
                for lb in lcr_bones
            ],
            "lcr_rewards": [
                {
                    "id": lr.srno,
                    "reference_id": lr.reference_id or "N/A",
                    "amount": float(lr.amount) if lr.amount else 0.0,
                    "type": lr.transactiontype or "N/A",
                    "received_by": lr.received_by or "N/A",
                    "received_from": lr.received_from or "N/A",
                    "status": "Active" if lr.status == 1 else "Inactive",
                    "date": lr.transactiondate.strftime('%Y-%m-%d') if lr.transactiondate else "N/A",
                    "time": lr.transactiondate.strftime('%H:%M:%S') if lr.transactiondate else "N/A",
                    "purpose": lr.purpose or "N/A",
                    "remark": lr.remark or "N/A"
                }
                for lr in lcr_rewards
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))