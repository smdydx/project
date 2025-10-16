from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import random
from models.models import User, Transactions


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
            total_lcr_money = db.query(func.sum(User.INRWalletBalance)).filter(
                User.IsDeleted == False
            ).scalar() or 0
            
            # Total distributor prime reward (sum of reward wallet balance)
            total_prime_reward = db.query(func.sum(User.RewardWalletBalance)).filter(
                User.IsDeleted == False
            ).scalar() or 0
            
            # Mobile and DTH recharge counts from transactions
            total_mobile_recharge = db.query(Transactions).filter(
                Transactions.TransactionType.in_(['Mobile Recharge', 'Recharge']),
                Transactions.IsDeleted == False
            ).count()
            
            total_dth_recharge = db.query(Transactions).filter(
                Transactions.TransactionType == 'DTH Recharge',
                Transactions.IsDeleted == False
            ).count()

            return {
                "total_users": total_users,
                "new_signups_today": new_signups_today,
                "kyc_verified_users": kyc_verified_users,
                "kyc_verification_percentage": round(kyc_verification_percentage, 2),
                "prime_users": prime_users,
                "total_distributor_lcr_money": float(total_lcr_money),
                "total_distributor_prime_reward": float(total_prime_reward),
                "total_mobile_recharge": total_mobile_recharge,
                "total_dth_recharge": total_dth_recharge
            }
        except Exception as e:
            print(f"Error fetching dashboard stats: {e}")
            return {
                "total_users": 0,
                "new_signups_today": 0,
                "kyc_verified_users": 0,
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
