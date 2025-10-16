from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, desc
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import List, Dict
from models.models import (
    User, Wallet, DirectIncome, LevelIncome,
    PrimeActivations, BillTransactions, Transactions, 
    LcrMoney, P2PTransaction
)
from models.payment_gateway import Payment_Gateway
from schemas.dashboard import (
    DashboardStatsResponse, ChartDataResponse,
    DailyVolumeData, ServiceDistributionData,
    LiveTransactionResponse, RecentUserResponse,
    TransactionDetailResponse
)

class DashboardService:

    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
        """Get comprehensive dashboard statistics with real-time data"""

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

        # Total LCR Money (sum of reward wallet balance)
        # Updated to use LcrMoney table
        total_lcr_money_result = db.query(func.sum(LcrMoney.amount)).filter(LcrMoney.status == 1).scalar()
        total_lcr = Decimal(total_lcr_money_result) if total_lcr_money_result else Decimal("0.00")

        # Total Prime Rewards distributed (from Wallet table)
        total_prime_reward_result = db.query(func.sum(Wallet.amount)).filter(Wallet.wallet_type == 'reward').scalar()
        total_prime_reward = Decimal(total_prime_reward_result) if total_prime_reward_result else Decimal("0.00")


        # Mobile recharge count (from Payment_Gateway)
        # Using purpose column to determine service type
        mobile_recharge_count = db.query(func.count(Payment_Gateway.id)).filter(
            Payment_Gateway.purpose.ilike('%mobile%'),
            Payment_Gateway.status == 'SUCCESS'
        ).scalar() or 0

        # DTH recharge count (from Payment_Gateway)
        dth_recharge_count = db.query(func.count(Payment_Gateway.id)).filter(
            Payment_Gateway.purpose.ilike('%dth%'),
            Payment_Gateway.status == 'SUCCESS'
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
    def get_recent_users(self, limit: int = 20) -> List[RecentUserResponse]:
        """Get recently registered users"""
        users = self.db.query(User)\
            .filter(User.IsDeleted == False)\
            .order_by(User.CreatedAt.desc())\
            .limit(limit)\
            .all()

        return [
            RecentUserResponse(
                id=user.UserID,
                name=user.fullname or "Unknown",
                email=user.Email or "",
                phone=user.MobileNumber or "",
                kyc_status="Verified" if user.IsKYCCompleted else "Pending",
                registered_at=user.CreatedAt.isoformat() if user.CreatedAt else datetime.now().isoformat()
            )
            for user in users
        ]

    def get_recent_transactions(self, limit: int = 50) -> List[LiveTransactionResponse]:
        """Get recent transactions from payment gateway"""
        transactions = self.db.query(Payment_Gateway)\
            .order_by(Payment_Gateway.created_at.desc())\
            .limit(limit)\
            .all()

        return [
            LiveTransactionResponse(
                id=f"TXN{txn.id}",
                user_name=txn.payer_name or "Unknown",
                service=txn.purpose or "Unknown Service",
                amount=float(txn.amount) if txn.amount else 0.0,
                status=txn.status or "PENDING",
                timestamp=txn.created_at.isoformat() if txn.created_at else datetime.now().isoformat()
            )
            for txn in transactions
        ]