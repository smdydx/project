from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Numeric
from datetime import datetime, timedelta
from decimal import Decimal
from models.models import User, Transactions
from models.payment_gateway import Payment_Gateway


class DashboardService:

    @staticmethod
    def get_dashboard_stats(db: Session):
        try:
            # Total users
            total_users = db.query(User).filter(User.IsDeleted == False).count()
            
            # New signups today
            today = datetime.now().date()
            new_signups_today = db.query(User).filter(
                func.date(User.CreatedAt) == today,
                User.IsDeleted == False
            ).count()
            
            # KYC verified users
            kyc_verified_users = db.query(User).filter(
                User.IsKYCCompleted == True,
                User.IsDeleted == False
            ).count()
            
            # KYC verification percentage
            kyc_verification_percentage = (
                (kyc_verified_users / total_users * 100) if total_users > 0 else 0
            )
            
            # Prime users
            prime_users = db.query(User).filter(
                User.prime_status == True,
                User.IsDeleted == False
            ).count()
            
            # Total distributor LCR money (sum of INR wallet balance)
            lcr_money_sum = db.query(func.sum(cast(User.INRWalletBalance, Numeric))).filter(
                User.IsDeleted == False
            ).scalar()
            total_lcr_money = float(lcr_money_sum) if lcr_money_sum else 0.0
            
            # Total distributor prime reward (sum of reward wallet balance)
            prime_reward_sum = db.query(func.sum(cast(User.RewardWalletBalance, Numeric))).filter(
                User.IsDeleted == False
            ).scalar()
            total_prime_reward = float(prime_reward_sum) if prime_reward_sum else 0.0
            
            # Mobile recharge from Payment_Gateway
            total_mobile_recharge = db.query(Payment_Gateway).filter(
                Payment_Gateway.purpose.ilike('%mobile%'),
                Payment_Gateway.status == 'success'
            ).count()
            
            # DTH recharge from Payment_Gateway
            total_dth_recharge = db.query(Payment_Gateway).filter(
                Payment_Gateway.purpose.ilike('%dth%'),
                Payment_Gateway.status == 'success'
            ).count()

            # Calculate verified accounts (KYC completed users)
            verified_accounts = kyc_verified_users

            return {
                "total_users": total_users,
                "new_signups_today": new_signups_today,
                "kyc_verified_users": kyc_verified_users,
                "verified_accounts": verified_accounts,
                "kyc_verification_percentage": round(kyc_verification_percentage, 2),
                "prime_users": prime_users,
                "total_distributor_lcr_money": round(total_lcr_money, 2),
                "total_distributor_prime_reward": round(total_prime_reward, 2),
                "total_mobile_recharge": total_mobile_recharge,
                "total_dth_recharge": total_dth_recharge
            }
        except Exception as e:
            print(f"Error fetching dashboard stats: {e}")
            import traceback
            traceback.print_exc()
            return {
                "total_users": 0,
                "new_signups_today": 0,
                "kyc_verified_users": 0,
                "verified_accounts": 0,
                "kyc_verification_percentage": 0.0,
                "prime_users": 0,
                "total_distributor_lcr_money": 0.0,
                "total_distributor_prime_reward": 0.0,
                "total_mobile_recharge": 0,
                "total_dth_recharge": 0
            }

    @staticmethod
    def get_recent_transactions(db: Session, limit: int = 50):
        transactions = db.query(Transactions).order_by(
            desc(Transactions.CreatedAt)).limit(limit).all()

        return [{
            "id": txn.TransactionID,
            "user": txn.UserName or "Unknown",
            "type": txn.TransactionType or "Recharge",
            "amount": float(txn.Amount) if txn.Amount else 0.0,
            "status": txn.Status,
            "date": txn.CreatedAt.strftime("%Y-%m-%d") if txn.CreatedAt else "",
            "time": txn.CreatedAt.strftime("%H:%M:%S") if txn.CreatedAt else ""
        } for txn in transactions]

    @staticmethod
    def get_live_transactions(db: Session, limit: int = 1):
        """Get latest live transactions for WebSocket streaming"""
        transactions = db.query(Transactions).order_by(
            desc(Transactions.CreatedAt)).limit(limit).all()

        return [{
            "id": txn.TransactionID,
            "user": txn.UserName or "Unknown",
            "type": txn.TransactionType or "Recharge",
            "amount": float(txn.Amount) if txn.Amount else 0.0,
            "status": txn.Status,
            "date": txn.CreatedAt.strftime("%Y-%m-%d") if txn.CreatedAt else "",
            "time": txn.CreatedAt.strftime("%H:%M:%S") if txn.CreatedAt else ""
        } for txn in transactions]

    @staticmethod
    def get_recent_users(db: Session, limit: int = 20):
        users = db.query(User).order_by(desc(
            User.CreatedAt)).limit(limit).all()

        return [{
            "id": user.UserID,
            "name": user.fullname or "Unknown",
            "email": user.Email or "",
            "mobile": user.MobileNumber or "",
            "status": "Active" if hasattr(user, 'IsActive') and user.IsActive else "Active",
            "joinDate": user.CreatedAt.strftime("%Y-%m-%d") if user.CreatedAt else ""
        } for user in users]

    @staticmethod
    def get_chart_data(db: Session):
        last_7_days = [
            datetime.now().date() - timedelta(days=i)
            for i in range(6, -1, -1)
        ]

        daily_volume = []
        for day in last_7_days:
            count = db.query(Transactions).filter(
                func.date(Transactions.CreatedAt) == day,
                Transactions.IsDeleted == False
            ).count()
            
            amount = db.query(func.sum(Transactions.Amount)).filter(
                func.date(Transactions.CreatedAt) == day,
                Transactions.IsDeleted == False
            ).scalar() or 0
            
            daily_volume.append({
                "name": day.strftime("%b %d"),
                "transactions": count,
                "amount": float(amount)
            })
        
        # Service distribution
        service_types = db.query(
            Transactions.TransactionType,
            func.count(Transactions.TransactionID).label('count')
        ).filter(
            Transactions.IsDeleted == False
        ).group_by(Transactions.TransactionType).all()
        
        colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
        service_distribution = [
            {
                "name": service[0] or "Other",
                "value": float(service[1]),
                "color": colors[i % len(colors)]
            }
            for i, service in enumerate(service_types)
        ]

        return {
            "daily_volume": daily_volume,
            "service_distribution": service_distribution if service_distribution else [
                {"name": "No Data", "value": 0, "color": "#gray"}
            ]
        }
