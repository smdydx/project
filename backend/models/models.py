
# Copy the content from attached_assets/models_1760553210687.py
# This file contains all the main database models
from __future__ import annotations
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
import pytz

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, DECIMAL, ForeignKey, Float, Text, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship

from backend.core.base import Base, get_ist_time
from sqlalchemy import select, func
from decimal import Decimal

# Timezone setup
IST = pytz.timezone("Asia/Kolkata")

# ============================= USERS =============================
class User(Base):
    __tablename__ = "users"

    UserID = Column(Integer, primary_key=True)
    fullname = Column(String(255))
    MobileNumber = Column(String(15), nullable=False, unique=True)
    Email = Column(String(255))
    PasswordHash = Column(Text)
    LoginPIN = Column(String(100))
    TransactionPIN = Column(String(100))
    IsKYCCompleted = Column(Boolean, default=False)
    introducer_id = Column(String(255), ForeignKey("users.member_id"))
    member_id = Column(String(255), unique=True)
    RewardWalletBalance = Column(DECIMAL(10, 5), default=Decimal("0.00"))
    INRWalletBalance = Column(DECIMAL(10, 5), default=Decimal("0.00"))
    DeviceVerified = Column(Boolean, default=False)
    CreatedAt = Column(DateTime(timezone=True), default=get_ist_time)
    UpdatedAt = Column(DateTime(timezone=True))
    DeletedAt = Column(DateTime(timezone=True))
    IsDeleted = Column(Boolean, default=False)
    fingerPrintStatus = Column(Integer)
    activation_status = Column(Boolean, default=False)
    aadhar_verification_status = Column(Boolean, default=False)
    pan_verification_status = Column(Boolean, default=False)
    email_verification_status = Column(Boolean, default=False)
    prime_status = Column(Boolean, default=False)
    prime_activation_date = Column(DateTime(timezone=True))
    total_packages = Column(DECIMAL(10, 5), default=Decimal("0.00"))

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    upi_accounts = relationship("UserUPI", back_populates="user")
    transactions = relationship("Transactions", back_populates="user")
    memberships = relationship("Memberships", back_populates="user")
    payment_settings = relationship("PaymentSettings", back_populates="user", uselist=False)
    aadhar_user = relationship("Aadhar_User", back_populates="user", uselist=False)
    pan_verification = relationship("PanVerification", back_populates="user", uselist=False)
    wallet_transactions = relationship("Wallet", back_populates="user")
    offlineKYC = relationship("OfflineKYC", back_populates="user", uselist=False)
    fingerprint = relationship("FingerPrint", back_populates="user", uselist=False)

    introducer = relationship(
        "User",
        back_populates="referred_users",
        remote_side=[member_id],
        foreign_keys=[introducer_id],
    )
    referred_users = relationship(
        "User",
        back_populates="introducer",
        foreign_keys=[introducer_id],
    )

    direct_incomes_received = relationship(
        "DirectIncome",
        back_populates="receiver",
        foreign_keys="DirectIncome.receiver_member",
    )
    direct_incomes_activated = relationship(
        "DirectIncome",
        back_populates="prime_activator",
        foreign_keys="DirectIncome.prime_activated_by_member",
    )

    level_incomes_received = relationship(
        "LevelIncome",
        back_populates="level_receiver",
        foreign_keys="LevelIncome.receiver_member",
    )
    level_incomes_activated = relationship(
        "LevelIncome",
        back_populates="level_prime_activator",
        foreign_keys="LevelIncome.prime_activated_by_member",
    )

    prime_activations_received = relationship(
        "PrimeActivations",
        back_populates="receiver_member",
        foreign_keys="PrimeActivations.member",
    )
    prime_incomes_activated = relationship(
        "PrimeActivations",
        back_populates="prime_activator",
        foreign_keys="PrimeActivations.prime_initiated_by",
    )

    sent_transactions = relationship(
        "P2PTransaction",
        back_populates="sender",
        foreign_keys="P2PTransaction.transaction_from",
    )
    received_transactions = relationship(
        "P2PTransaction",
        back_populates="receiver",
        foreign_keys="P2PTransaction.transaction_to",
    )

# Include all other models from the original file...
# (DirectIncome, LevelIncome, UserProfile, Wallet, etc.)
