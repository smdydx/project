
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import List, Dict
from backend.models.models import (
    User, Wallet, DirectIncome, LevelIncome, 
    PrimeActivations, RechargeIncentivesIncomeDistribution,
    BillTransactions, Transactions
)
from backend.models.payment_gateway import Payment_Gateway
from backend.schemas.dashboard import (
    DashboardStatsResponse, ChartDataResponse, 
    DailyVolumeData, ServiceDistributionData,
    LiveTransactionResponse, RecentUserResponse,
    TransactionDetailResponse
)

class DashboardService:
    
    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
        """Get comprehensive dashboard statistics"""
        
        # Total registered users (not deleted)
        total_users = db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False
        ).scalar() or 0
        
        # New users today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        new_users_today = db.query(func.count(User.UserID)).filter(
            and_(
                User.CreatedAt >= today_start,
                User.IsDeleted == False
            )
        ).scalar() or 0
        
        # KYC verified users
        kyc_verified = db.query(func.count(User.UserID)).filter(
            and_(
                User.IsKYCCompleted == True,
                User.IsDeleted == False
            )
        ).scalar() or 0
        
        kyc_percentage = (kyc_verified / total_users * 100) if total_users > 0 else 0.0
        
        # Total Prime users
        prime_users = db.query(func.count(User.UserID)).filter(
            and_(
                User.prime_status == True,
                User.IsDeleted == False
            )
        ).scalar() or 0
        
        # Total Distributor LCR Money (sum of reward wallet balance)
        total_lcr = db.query(func.sum(User.RewardWalletBalance)).filter(
            User.IsDeleted == False
        ).scalar() or Decimal("0.00")
        
        # Total Prime Rewards distributed
        total_prime_reward = db.query(func.sum(DirectIncome.amount)).scalar() or Decimal("0.00")
        
        # Mobile recharge count (from recharge incentives)
        mobile_recharge_count = db.query(func.count(RechargeIncentivesIncomeDistribution.id)).filter(
            RechargeIncentivesIncomeDistribution.service_used.like('%mobile%')
        ).scalar() or 0
        
        # DTH recharge count
        dth_recharge_count = db.query(func.count(RechargeIncentivesIncomeDistribution.id)).filter(
            RechargeIncentivesIncomeDistribution.service_used.like('%dth%')
        ).scalar() or 0
        
        return DashboardStatsResponse(
            total_registered_users=total_users,
            new_users_today=new_users_today,
            total_kyc_verified=kyc_verified,
            kyc_verification_percentage=round(kyc_percentage, 2),
            total_prime_users=prime_users,
            total_distributor_lcr_money=total_lcr,
            total_distributor_prime_reward=total_prime_reward,
            total_mobile_recharge=mobile_recharge_count,
            total_dth_recharge=dth_recharge_count
        )
    
    @staticmethod
    def get_chart_data(db: Session) -> ChartDataResponse:
        """Get chart data for visualization"""
        
        # Daily volume for last 7 days
        daily_volume = []
        for i in range(7):
            day_date = date.today() - timedelta(days=6-i)
            day_start = datetime.combine(day_date, datetime.min.time())
            day_end = datetime.combine(day_date, datetime.max.time())
            
            txn_count = db.query(func.count(Payment_Gateway.id)).filter(
                and_(
                    Payment_Gateway.created_at >= day_start,
                    Payment_Gateway.created_at <= day_end,
                    Payment_Gateway.status == 'SUCCESS'
                )
            ).scalar() or 0
            
            txn_amount = db.query(func.sum(Payment_Gateway.amount)).filter(
                and_(
                    Payment_Gateway.created_at >= day_start,
                    Payment_Gateway.created_at <= day_end,
                    Payment_Gateway.status == 'SUCCESS'
                )
            ).scalar() or 0.0
            
            daily_volume.append(DailyVolumeData(
                name=day_date.strftime('%a'),
                transactions=txn_count,
                amount=float(txn_amount)
            ))
        
        # Service distribution
        service_colors = {
            'Electricity': '#3B82F6',
            'Gas': '#6366F1',
            'Mobile': '#10B981',
            'DTH': '#F59E0B',
            'Water': '#EF4444',
            'Others': '#8B5CF6'
        }
        
        service_dist = []
        total_services = db.query(func.count(Payment_Gateway.id)).filter(
            Payment_Gateway.status == 'SUCCESS'
        ).scalar() or 1
        
        for service_name, color in service_colors.items():
            count = db.query(func.count(Payment_Gateway.id)).filter(
                and_(
                    Payment_Gateway.purpose.like(f'%{service_name.lower()}%'),
                    Payment_Gateway.status == 'SUCCESS'
                )
            ).scalar() or 0
            
            percentage = (count / total_services * 100) if total_services > 0 else 0
            
            service_dist.append(ServiceDistributionData(
                name=service_name,
                value=round(percentage, 2),
                color=color
            ))
        
        return ChartDataResponse(
            daily_volume=daily_volume,
            service_distribution=service_dist
        )
    
    @staticmethod
    def get_live_transactions(db: Session, limit: int = 10) -> List[LiveTransactionResponse]:
        """Get latest transactions"""
        
        recent_txns = db.query(Payment_Gateway).order_by(
            Payment_Gateway.created_at.desc()
        ).limit(limit).all()
        
        result = []
        for txn in recent_txns:
            user = db.query(User).filter(User.MobileNumber == txn.payer_mobile).first()
            
            result.append(LiveTransactionResponse(
                id=txn.client_txn_id,
                user=user.fullname if user else txn.payer_name or "Unknown",
                service=txn.purpose or "General",
                amount=float(txn.amount),
                status=txn.status,
                timestamp=txn.created_at
            ))
        
        return result
    
    @staticmethod
    def get_recent_users(db: Session, limit: int = 10) -> List[RecentUserResponse]:
        """Get recently registered users"""
        
        recent_users = db.query(User).filter(
            User.IsDeleted == False
        ).order_by(User.CreatedAt.desc()).limit(limit).all()
        
        result = []
        for user in recent_users:
            role = "Prime" if user.prime_status else "Normal"
            result.append(RecentUserResponse(
                id=user.member_id or str(user.UserID),
                name=user.fullname or "N/A",
                role=role,
                joined_on=user.CreatedAt,
                mobile=user.MobileNumber
            ))
        
        return result
