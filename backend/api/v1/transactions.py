
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
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get mobile recharge transactions"""
    try:
        query = db.query(Payment_Gateway).filter(
            Payment_Gateway.purpose.ilike('%mobile%')
        )
        
        if status and status.lower() != 'all':
            query = query.filter(Payment_Gateway.status == status.upper())
        
        transactions = query.order_by(desc(Payment_Gateway.created_at)).limit(limit).all()
        
        result = []
        for txn in transactions:
            result.append({
                "id": txn.id,
                "transactionId": txn.client_txn_id,
                "user": txn.payer_name or "Unknown",
                "mobileNumber": txn.payer_mobile,
                "operator": "Unknown",
                "circle": "Unknown",
                "amount": float(txn.amount) if txn.amount else 0,
                "status": txn.status.capitalize() if txn.status else "Pending",
                "date": txn.created_at.strftime('%Y-%m-%d') if txn.created_at else "",
                "time": txn.created_at.strftime('%H:%M:%S') if txn.created_at else "",
                "referenceId": txn.sabpaisa_txn_id or txn.client_txn_id
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dth")
async def get_dth_transactions(
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get DTH recharge transactions"""
    try:
        query = db.query(Payment_Gateway).filter(
            Payment_Gateway.purpose.ilike('%dth%')
        )
        
        if status and status.lower() != 'all':
            query = query.filter(Payment_Gateway.status == status.upper())
        
        transactions = query.order_by(desc(Payment_Gateway.created_at)).limit(limit).all()
        
        result = []
        for txn in transactions:
            result.append({
                "id": txn.id,
                "transactionId": txn.client_txn_id,
                "user": txn.payer_name or "Unknown",
                "subscriberId": txn.payer_mobile,
                "operator": "Unknown",
                "plan": "Unknown",
                "amount": float(txn.amount) if txn.amount else 0,
                "status": txn.status.capitalize() if txn.status else "Pending",
                "date": txn.created_at.strftime('%Y-%m-%d') if txn.created_at else "",
                "time": txn.created_at.strftime('%H:%M:%S') if txn.created_at else "",
                "referenceId": txn.sabpaisa_txn_id or txn.client_txn_id
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
