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


@router.get("/service-types")
async def get_service_types(db: Session = Depends(get_db)):
    """Get all unique service types"""
    try:
        service_types = db.query(Service_Request.service_type).distinct().all()
        return [st[0] for st in service_types if st[0]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mobile")
async def get_mobile_transactions(
    limit: int = Query(500, le=1000),
    service_type: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get all service request transactions with filters"""
    try:
        # Base query excluding pending by default
        query = db.query(Service_Request).filter(
            Service_Request.status.in_(['completed', 'failed', 'processing', 'paid'])
        )
        
        # Apply service type filter if provided
        if service_type and service_type != 'all':
            query = query.filter(Service_Request.service_type == service_type)
        
        # Apply status filter if provided
        if status and status != 'all':
            query = query.filter(Service_Request.status == status)
        
        service_requests = query.order_by(desc(Service_Request.created_at)).limit(limit).all()

        result = []
        for sr in service_requests:
            result.append({
                "id": sr.id,
                "user_id": sr.user_id,
                "service_type": sr.service_type or "N/A",
                "operator_code": sr.operator_code,
                "mobile_number": sr.mobile_number,
                "amount": str(sr.amount) if sr.amount else "0",
                "reference_id": sr.reference_id or "N/A",
                "status": sr.status or "unknown",
                "payment_txn_id": sr.payment_txn_id,
                "utr_no": sr.utr_no,
                "created_at": sr.created_at.isoformat() if sr.created_at else None,
                "updated_at": sr.updated_at.isoformat() if sr.updated_at else None
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payment-details/{reference_id}")
async def get_payment_details_by_reference(
    reference_id: str,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get all payment gateway transactions, LCR Money and LCR Rewards for a specific reference ID"""
    try:
        # Get service request with optimized query
        service_request = db.query(Service_Request).filter(
            Service_Request.reference_id == reference_id
        ).first()
        
        if not service_request:
            raise HTTPException(status_code=404, detail="Service request not found")
        
        # Get all payment gateway records for this service request (limited)
        payments = db.query(Payment_Gateway).filter(
            Payment_Gateway.service_request_id == service_request.id
        ).order_by(desc(Payment_Gateway.created_at)).limit(limit).all()
        
        # Get user details
        user = db.query(User).filter(User.UserID == service_request.user_id).first()
        
        # Get LCR Money transactions for this reference ID (optimized with limit)
        lcr_money = db.query(LcrMoney).filter(
            LcrMoney.reference_id == reference_id
        ).order_by(desc(LcrMoney.transactiondate)).limit(limit).all()
        
        # Get LCR Rewards transactions for this reference ID (optimized with limit)
        lcr_rewards = db.query(LcrRewards).filter(
            LcrRewards.reference_id == reference_id
        ).order_by(desc(LcrRewards.transactiondate)).limit(limit).all()
        
        return {
            "service_request": {
                "id": service_request.id,
                "reference_id": service_request.reference_id,
                "service_type": service_request.service_type,
                "operator_code": service_request.operator_code,
                "mobile_number": service_request.mobile_number,
                "amount": float(service_request.amount),
                "status": service_request.status,
                "payment_txn_id": service_request.payment_txn_id,
                "utr_no": service_request.utr_no,
                "created_at": service_request.created_at.isoformat() if service_request.created_at else None,
                "updated_at": service_request.updated_at.isoformat() if service_request.updated_at else None,
                "metadata": service_request.service_metadata
            },
            "user": {
                "id": user.UserID if user else None,
                "name": user.fullname if user else "Unknown",
                "mobile": user.MobileNumber if user else "N/A",
                "email": user.Email if user else "N/A",
                "member_id": user.member_id if user else "N/A"
            },
            "payment_gateway_transactions": [
                {
                    "id": pg.id,
                    "client_txn_id": pg.client_txn_id,
                    "sabpaisa_txn_id": pg.sabpaisa_txn_id,
                    "payer_name": pg.payer_name,
                    "payer_email": pg.payer_email,
                    "payer_mobile": pg.payer_mobile,
                    "amount": float(pg.amount) if pg.amount else 0,
                    "paid_amount": float(pg.paid_amount) if pg.paid_amount else 0,
                    "payment_mode": pg.payment_mode,
                    "bank_name": pg.bank_name,
                    "rrn": pg.rrn,
                    "purpose": pg.purpose,
                    "status": pg.status,
                    "status_code": pg.status_code,
                    "sabpaisa_message": pg.sabpaisa_message,
                    "service_data": pg.service_data,
                    "amount_type": pg.amount_type,
                    "challan_number": pg.challan_number,
                    "bank_error_code": pg.bank_error_code,
                    "sabpaisa_error_code": pg.sabpaisa_error_code,
                    "trans_date": pg.trans_date.isoformat() if pg.trans_date else None,
                    "created_at": pg.created_at.isoformat() if pg.created_at else None,
                    "updated_at": pg.updated_at.isoformat() if pg.updated_at else None
                }
                for pg in payments
            ],
            "lcr_money_transactions": [
                {
                    "id": lm.srno,
                    "amount": float(lm.amount) if lm.amount else 0.0,
                    "type": lm.transactiontype or "N/A",
                    "received_by": lm.received_by or "N/A",
                    "received_from": lm.received_from or "N/A",
                    "status": "Active" if lm.status == 1 else "Inactive",
                    "date": lm.transactiondate.strftime('%Y-%m-%d') if lm.transactiondate else "N/A",
                    "time": lm.transactiondate.strftime('%H:%M:%S') if lm.transactiondate else "N/A",
                    "purpose": lm.purpose or "N/A",
                    "remark": lm.remark or "N/A"
                }
                for lm in lcr_money
            ],
            "lcr_rewards_transactions": [
                {
                    "id": lr.srno,
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