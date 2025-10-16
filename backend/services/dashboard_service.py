from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from models.models import User
from models.payment_gateway import PaymentGateway
from datetime import datetime, timedelta

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_stats(self):
        """Get dashboard statistics"""
        # Total users
        total_users = self.db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False
        ).scalar() or 0

        # Active users (KYC completed)
        active_users = self.db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False,
            User.IsKYCCompleted == True
        ).scalar() or 0

        # Total transactions
        total_transactions = self.db.query(func.count(PaymentGateway.id)).scalar() or 0

        # Success transactions
        success_transactions = self.db.query(func.count(PaymentGateway.id)).filter(
            PaymentGateway.status == "success"
        ).scalar() or 0

        # Total revenue
        total_revenue = self.db.query(func.sum(PaymentGateway.amount)).filter(
            PaymentGateway.status == "success"
        ).scalar() or 0

        # Today's registrations
        today = datetime.now().date()
        today_registrations = self.db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False,
            func.date(User.CreatedAt) == today
        ).scalar() or 0

        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_transactions": total_transactions,
            "success_transactions": success_transactions,
            "total_revenue": float(total_revenue),
            "today_registrations": today_registrations
        }

    def get_chart_data(self):
        """Get chart data for dashboard"""
        # Last 7 days user registrations
        seven_days_ago = datetime.now() - timedelta(days=7)
        user_registrations = self.db.query(
            func.date(User.CreatedAt).label('date'),
            func.count(User.UserID).label('count')
        ).filter(
            User.IsDeleted == False,
            User.CreatedAt >= seven_days_ago
        ).group_by(
            func.date(User.CreatedAt)
        ).all()

        # Last 7 days transactions
        transaction_data = self.db.query(
            func.date(PaymentGateway.created_at).label('date'),
            func.count(PaymentGateway.id).label('count'),
            func.sum(PaymentGateway.amount).label('amount')
        ).filter(
            PaymentGateway.created_at >= seven_days_ago
        ).group_by(
            func.date(PaymentGateway.created_at)
        ).all()

        return {
            "user_registrations": [
                {
                    "date": str(item.date),
                    "count": item.count
                }
                for item in user_registrations
            ],
            "transactions": [
                {
                    "date": str(item.date),
                    "count": item.count,
                    "amount": float(item.amount) if item.amount else 0
                }
                for item in transaction_data
            ]
        }

    def get_recent_users(self, limit: int = 20):
        """Get recently registered users"""
        users = self.db.query(User).filter(
            User.IsDeleted == False
        ).order_by(
            desc(User.CreatedAt)
        ).limit(limit).all()

        return [
            {
                "UserID": user.UserID,
                "fullname": user.fullname,
                "MobileNumber": user.MobileNumber,
                "Email": user.Email,
                "IsKYCCompleted": user.IsKYCCompleted,
                "CreatedAt": user.CreatedAt.isoformat() if user.CreatedAt else None,
                "activation_status": user.activation_status,
                "prime_status": user.prime_status
            }
            for user in users
        ]

    def get_recent_transactions(self, limit: int = 50):
        """Get recent transactions"""
        transactions = self.db.query(PaymentGateway).order_by(
            desc(PaymentGateway.created_at)
        ).limit(limit).all()

        return [
            {
                "id": txn.id,
                "payer_name": txn.payer_name,
                "payer_mobile": txn.payer_mobile,
                "amount": float(txn.amount) if txn.amount else 0,
                "purpose": txn.purpose,
                "status": txn.status,
                "payment_mode": txn.payment_mode,
                "created_at": txn.created_at.isoformat() if txn.created_at else None
            }
            for txn in transactions
        ]