
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.payment_gateway import Payment_Gateway
from sqlalchemy import desc, or_
from datetime import datetime

router = APIRouter(tags=["transactions"])

@router.get("/mobile")
async def get_mobile_transactions(
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get mobile recharge transactions"""
    try:
        transactions = db.query(Payment_Gateway).filter(
            or_(
                Payment_Gateway.purpose.ilike('%mobile%'),
                Payment_Gateway.purpose.ilike('%recharge%')
            )
        ).order_by(desc(Payment_Gateway.created_at)).limit(limit).all()
        
        result = []
        for txn in transactions:
            # Get operator and circle from service_data JSON if available
            operator = "Unknown"
            circle = "Unknown"
            if txn.service_data:
                operator = txn.service_data.get('operator', 'Unknown')
                circle = txn.service_data.get('circle', 'Unknown')
            
            # Determine status
            status = "Success" if txn.status and txn.status.lower() == "success" else "Pending" if txn.status and txn.status.lower() == "pending" else "Failed"
            
            result.append({
                "id": txn.id,
                "transactionId": txn.client_txn_id or f"TXN{txn.id:06d}",
                "user": txn.payer_name or "Unknown",
                "mobileNumber": txn.payer_mobile or "",
                "operator": operator,
                "circle": circle,
                "amount": float(txn.amount) if txn.amount else 0,
                "status": status,
                "date": txn.created_at.strftime('%Y-%m-%d') if txn.created_at else "",
                "time": txn.created_at.strftime('%H:%M:%S') if txn.created_at else "",
                "referenceId": txn.rrn or txn.sabpaisa_txn_id or txn.client_txn_id or f"REF{txn.id}"
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
        transactions = db.query(Payment_Gateway).filter(
            Payment_Gateway.purpose.ilike('%dth%')
        ).order_by(desc(Payment_Gateway.created_at)).limit(limit).all()
        
        result = []
        for txn in transactions:
            # Get operator, plan, subscriber ID from service_data JSON if available
            operator = "Unknown"
            plan = "Standard"
            subscriber_id = f"SUB{txn.id}"
            if txn.service_data:
                operator = txn.service_data.get('operator', 'Unknown')
                plan = txn.service_data.get('plan', 'Standard')
                subscriber_id = txn.service_data.get('subscriber_id', f"SUB{txn.id}")
            
            # Determine status
            status = "Success" if txn.status and txn.status.lower() == "success" else "Pending" if txn.status and txn.status.lower() == "pending" else "Failed"
            
            result.append({
                "id": txn.id,
                "transactionId": txn.client_txn_id or f"DTH{txn.id:06d}",
                "user": txn.payer_name or "Unknown",
                "subscriberId": subscriber_id,
                "operator": operator,
                "plan": plan,
                "amount": float(txn.amount) if txn.amount else 0,
                "status": status,
                "date": txn.created_at.strftime('%Y-%m-%d') if txn.created_at else "",
                "time": txn.created_at.strftime('%H:%M:%S') if txn.created_at else "",
                "referenceId": txn.rrn or txn.sabpaisa_txn_id or txn.client_txn_id or f"REF{txn.id}"
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.payment_gateway import Payment_Gateway
from models.models import User
from sqlalchemy import desc, or_
from datetime import datetime

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
