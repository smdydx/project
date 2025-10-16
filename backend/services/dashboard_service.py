from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import random
from models.models import User, Transactions


class DashboardService:

    @staticmethod
    def get_dashboard_stats(db: Session):
        total_users = db.query(User).count()
        total_transactions = db.query(Transactions).count()

        today = datetime.now().date()
        today_users = db.query(User).filter(
            func.date(User.created_at) == today).count()

        total_revenue = db.query(func.sum(Transactions.amount)).filter(
            Transactions.status == 'success').scalar() or 0

        return {
            "totalUsers": total_users,
            "totalTransactions": total_transactions,
            "todayUsers": today_users,
            "totalRevenue": float(total_revenue)
        }

    @staticmethod
    def get_recent_transactions(db: Session, limit: int = 50):
        transactions = db.query(Transactions).order_by(
            desc(Transactions.created_at)).limit(limit).all()

        return [{
            "id": txn.id,
            "user": txn.user_name or "Unknown",
            "type": txn.transaction_type or "Recharge",
            "amount": float(txn.amount),
            "status": txn.status,
            "date": txn.created_at.strftime("%Y-%m-%d"),
            "time": txn.created_at.strftime("%H:%M:%S")
        } for txn in transactions]

    @staticmethod
    def get_recent_users(db: Session, limit: int = 20):
        users = db.query(User).order_by(desc(
            User.created_at)).limit(limit).all()

        return [{
            "id": user.id,
            "name": user.name or "Unknown",
            "email": user.email or "",
            "mobile": user.mobile or "",
            "status": "Active" if user.is_active else "Blocked",
            "joinDate": user.created_at.strftime("%Y-%m-%d")
        } for user in users]

    @staticmethod
    def get_chart_data(db: Session):
        last_7_days = [
            datetime.now().date() - timedelta(days=i)
            for i in range(6, -1, -1)
        ]

        daily_data = []
        for day in last_7_days:
            count = db.query(Transactions).filter(
                func.date(Transactions.created_at) == day).count()
            daily_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "transactions": count
            })

        return {"daily": daily_data, "monthly": []}
