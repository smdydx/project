from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, desc
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import List, Dict
from backend.models.models import (
    User, Wallet, DirectIncome, LevelIncome,
    PrimeActivations, BillTransactions, Transactions, 
    LcrMoney, P2PTransaction, RechargeTransactions
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
        # Updated to use LcrMoney table
        total_lcr_money_result = db.query(func.sum(LcrMoney.amount)).filter(LcrMoney.status == 1).scalar()
        total_lcr = Decimal(total_lcr_money_result) if total_lcr_money_result else Decimal("0.00")

        # Total Prime Rewards distributed (from Wallet table)
        total_prime_reward_result = db.query(func.sum(Wallet.amount)).filter(Wallet.wallet_type == 'reward').scalar()
        total_prime_reward = Decimal(total_prime_reward_result) if total_prime_reward_result else Decimal("0.00")


        # Mobile recharge count (from RechargeTransactions)
        # Using service_type column as per original model
        mobile_recharge_count = db.query(func.count(RechargeTransactions.id)).filter(
            RechargeTransactions.service_type.ilike('%mobile%'),
            RechargeTransactions.status == 'SUCCESS'
        ).scalar() or 0

        # DTH recharge count (from RechargeTransactions)
        dth_recharge_count = db.query(func.count(RechargeTransactions.id)).filter(
            RechargeTransactions.service_type.ilike('%dth%'),
            RechargeTransactions.status == 'SUCCESS'
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
        # Total successful transactions for percentage calculation
        total_services = db.query(func.count(Payment_Gateway.id)).filter(
            Payment_Gateway.status == 'SUCCESS'
        ).scalar() or 1

        for service_name, color in service_colors.items():
            # Using Payment_Gateway.purpose to determine service type
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
        """Get latest transactions from Wallet table"""

        # Querying from Wallet table and joining with User for user details
        wallet_txns = db.query(
            Wallet.id,
            User.fullname,
            Wallet.transaction_type,
            Wallet.amount,
            Wallet.transaction_date
        ).join(User, User.UserID == Wallet.member_id).order_by(
            desc(Wallet.transaction_date)
        ).limit(limit).all()

        return [
            {
                "id": t.id,
                "user": t.fullname or "Unknown",
                "type": t.transaction_type or "Unknown",
                "amount": float(t.amount) if t.amount else 0.0,
                "status": "completed", # Assuming all wallet transactions are completed for this view
                "timestamp": t.transaction_date.isoformat() if t.transaction_date else None
            }
            for t in wallet_txns
        ]

    @staticmethod
    def get_recent_users(db: Session, limit: int = 10) -> List[RecentUserResponse]:
        """Get recently registered users with their details"""

        users = db.query(User).filter(
            User.IsDeleted == False
        ).order_by(desc(User.CreatedAt)).limit(limit).all()

        return [
            {
                "id": u.UserID,
                "name": u.fullname or "Unknown",
                "email": u.Email or "",
                "phone": u.MobileNumber or "",
                "member_id": u.member_id or "",
                "kyc_status": "Verified" if u.IsKYCCompleted else "Pending",
                "prime_status": u.prime_status or False,
                "reward_balance": float(u.RewardWalletBalance) if u.RewardWalletBalance else 0.0,
                "inr_balance": float(u.INRWalletBalance) if u.INRWalletBalance else 0.0,
                "joined_date": u.CreatedAt.isoformat() if u.CreatedAt else None
            }
            for u in users
        ]