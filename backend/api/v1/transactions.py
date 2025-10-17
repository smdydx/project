from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from datetime import datetime

from core.database import get_db
from models.payment_gateway import Payment_Gateway
from models.models import User

router = APIRouter(tags=["transactions"])

@router.get("/mobile")
async def get_mobile_transactions(
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get mobile recharge transactions"""
    try:
        transactions = db.query(Payment_Gateway).join(
            User, Payment_Gateway.payer_mobile == User.MobileNumber
        ).filter(
            or_(
                Payment_Gateway.purpose.ilike('%mobile%'),
                Payment_Gateway.purpose.ilike('%recharge%')
            )
        ).order_by(desc(Payment_Gateway.created_at)).limit(limit).all()

        result = []
        for txn in transactions:
            user = db.query(User).filter(User.MobileNumber == txn.payer_mobile).first()
            result.append({
                "id": txn.id,
                "transactionId": f"TXN{txn.id:06d}",
                "user": txn.payer_name or (user.fullname if user else "Unknown"),
                "mobileNumber": txn.payer_mobile or "",
                "operator": txn.service_data.get('operator', 'Unknown') if txn.service_data else 'Unknown',
                "circle": txn.service_data.get('circle', 'Unknown') if txn.service_data else 'Unknown',
                "amount": float(txn.amount) if txn.amount else 0,
                "status": "Success" if txn.status == "success" else "Pending" if txn.status == "pending" else "Failed",
                "date": txn.created_at.strftime('%Y-%m-%d') if txn.created_at else "",
                "time": txn.created_at.strftime('%H:%M:%S') if txn.created_at else "",
                "referenceId": txn.rrn or f"REF{txn.id}"
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



@router.get("/user/{user_id}/all")
async def get_user_all_transactions(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all transactions for a specific user - Service Requests + LCR Money"""
    try:
        from models.service_request import Service_Request
        from models.models import LcrMoney, User
        
        # Get user details
        user = db.query(User).filter(User.UserID == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Service Requests (excluding pending)
        service_requests = db.query(Service_Request).filter(
            Service_Request.user_id == user_id,
            Service_Request.status != 'pending'
        ).order_by(desc(Service_Request.created_at)).all()
        
        # LCR Bones
        lcr_bones = db.query(LcrMoney).filter(
            LcrMoney.received_by == user.member_id,
            LcrMoney.received_for == 'bones'
        ).order_by(desc(LcrMoney.transactiondate)).all()
        
        # LCR Reward
        lcr_rewards = db.query(LcrMoney).filter(
            LcrMoney.received_by == user.member_id,
            LcrMoney.received_for == 'reward'
        ).order_by(desc(LcrMoney.transactiondate)).all()
        
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
                    "operator": sr.operator_code,
                    "mobile": sr.mobile_number,
                    "amount": float(sr.amount),
                    "status": sr.status,
                    "payment_txn_id": sr.payment_txn_id,
                    "utr_no": sr.utr_no,
                    "date": sr.created_at.strftime('%Y-%m-%d'),
                    "time": sr.created_at.strftime('%H:%M:%S')
                }
                for sr in service_requests
            ],
            "lcr_bones": [
                {
                    "id": lb.srno,
                    "amount": float(lb.amount),
                    "type": lb.transactiontype,
                    "received_from": lb.received_from,
                    "status": "Active" if lb.status == 1 else "Inactive",
                    "date": lb.transactiondate.strftime('%Y-%m-%d') if lb.transactiondate else "",
                    "time": lb.transactiondate.strftime('%H:%M:%S') if lb.transactiondate else "",
                    "remark": lb.remark
                }
                for lb in lcr_bones
            ],
            "lcr_rewards": [
                {
                    "id": lr.srno,
                    "amount": float(lr.amount),
                    "type": lr.transactiontype,
                    "received_from": lr.received_from,
                    "status": "Active" if lr.status == 1 else "Inactive",
                    "date": lr.transactiondate.strftime('%Y-%m-%d') if lr.transactiondate else "",
                    "time": lr.transactiondate.strftime('%H:%M:%S') if lr.transactiondate else "",
                    "remark": lr.remark
                }
                for lr in lcr_rewards
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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