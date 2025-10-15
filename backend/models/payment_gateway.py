
from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from sqlalchemy import VARCHAR, NUMERIC, JSON, TIMESTAMP, text, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.core.base import Base, IntPrimaryKeyMixin

class Payment_Gateway(IntPrimaryKeyMixin, Base):
    __tablename__ = "payment_gateway"

    payer_name: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    payer_email: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    payer_mobile: Mapped[str] = mapped_column(VARCHAR(20), index=True)
    
    client_txn_id: Mapped[str] = mapped_column(VARCHAR(50), unique=True, index=True)
    sabpaisa_txn_id: Mapped[Optional[str]] = mapped_column(VARCHAR(50), index=True)
    amount: Mapped[Decimal] = mapped_column(NUMERIC(10, 2))
    paid_amount: Mapped[Optional[Decimal]] = mapped_column(NUMERIC(10, 2))
    payment_mode: Mapped[Optional[str]] = mapped_column(VARCHAR(20))
    bank_name: Mapped[Optional[str]] = mapped_column(VARCHAR(50))
    rrn: Mapped[Optional[str]] = mapped_column(VARCHAR(50), index=True)
    
    purpose: Mapped[Optional[str]] = mapped_column(VARCHAR(50), index=True)
    status: Mapped[str] = mapped_column(VARCHAR(20), server_default=text("'PENDING'"), index=True)
    status_code: Mapped[Optional[str]] = mapped_column(VARCHAR(10))
    sabpaisa_message: Mapped[Optional[str]] = mapped_column(VARCHAR(255))
    
    service_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    trans_date: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), index=True)
    
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_pg_mobile_status", "payer_mobile", "status"),
        Index("ix_pg_purpose_status", "purpose", "status"),
    )
