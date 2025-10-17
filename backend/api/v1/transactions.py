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

        # LCR Bones - joined by reference_id from service_requests
        service_reference_ids = [sr.reference_id for sr in service_requests]

        lcr_bones = db.query(LcrMoney).filter(
            LcrMoney.reference_id.in_(service_reference_ids),
            LcrMoney.received_for == 'bones'
        ).order_by(desc(LcrMoney.transactiondate)).all()

        # LCR Rewards - joined by reference_id from service_requests (using LcrRewards table)
        lcr_rewards = db.query(LcrRewards).filter(
            LcrRewards.reference_id.in_(service_reference_ids),
            LcrRewards.received_for == 'reward'
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
                    "reference_id": lb.reference_id or "",
                    "amount": float(lb.amount) if lb.amount else 0.0,
                    "type": lb.transactiontype or "",
                    "received_by": lb.received_by or "",
                    "received_from": lb.received_from or "",
                    "status": "Active" if lb.status == 1 else "Inactive",
                    "date": lb.transactiondate.strftime('%Y-%m-%d') if lb.transactiondate else "",
                    "time": lb.transactiondate.strftime('%H:%M:%S') if lb.transactiondate else "",
                    "purpose": lb.purpose or "",
                    "remark": lb.remark or "",
                    "other": lb.other or ""
                }
                for lb in lcr_bones
            ],
            "lcr_rewards": [
                {
                    "id": lr.srno,
                    "reference_id": lr.reference_id or "",
                    "amount": float(lr.amount) if lr.amount else 0.0,
                    "type": lr.transactiontype or "",
                    "received_by": lr.received_by or "",
                    "received_from": lr.received_from or "",
                    "status": "Active" if lr.status == 1 else "Inactive",
                    "date": lr.transactiondate.strftime('%Y-%m-%d') if lr.transactiondate else "",
                    "time": lr.transactiondate.strftime('%H:%M:%S') if lr.transactiondate else "",
                    "purpose": lr.purpose or "",
                    "remark": lr.remark or "",
                    "other": lr.other or ""
                }
                for lr in lcr_rewards
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))