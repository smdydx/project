
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class DashboardStatsResponse(BaseModel):
    total_users: int
    new_signups_today: int
    kyc_verified_users: int
    kyc_verification_percentage: float
    prime_users: int
    total_distributor_lcr_money: Decimal
    total_distributor_prime_reward: Decimal
    total_mobile_recharge: int
    total_dth_recharge: int
    active_system_status: bool = True
    
    class Config:
        from_attributes = True

class DailyVolumeData(BaseModel):
    name: str
    transactions: int
    amount: float

class ServiceDistributionData(BaseModel):
    name: str
    value: float
    color: str

class ChartDataResponse(BaseModel):
    daily_volume: List[DailyVolumeData]
    service_distribution: List[ServiceDistributionData]

class LiveTransactionResponse(BaseModel):
    id: str
    user: str
    service: str
    amount: float
    status: str
    timestamp: datetime
    
class RecentUserResponse(BaseModel):
    id: str
    name: str
    role: str
    joined_on: datetime
    mobile: Optional[str] = None
    
class TransactionDetailResponse(BaseModel):
    id: str
    user: str
    service: str
    amount: float
    status: str
    date: datetime
    reference_id: str

class ComplaintResponse(BaseModel):
    id: str
    user: str
    txn_id: str
    issue_type: str
    status: str
    submitted_on: datetime
    description: str
