from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import random
from models.models import User, Transactions


class DashboardService:

    @staticmethod
    def get_dashboard_stats(db: Session):
        try:
            total_users = db.query(User).count()
            total_transactions = db.query(Transactions).count()

            today = datetime.now().date()
            today_users = db.query(User).filter(
                func.date(User.CreatedAt) == today).count()

            total_revenue = db.query(func.sum(Transactions.Amount)).filter(
                Transactions.Status == 'success').scalar() or 0

            return {
                "totalUsers": total_users,
                "totalTransactions": total_transactions,
                "todayUsers": today_users,
                "totalRevenue": float(total_revenue)
            }
        except Exception as e:
            print(f"Error fetching dashboard stats: {e}")
            return {
                "totalUsers": 0,
                "totalTransactions": 0,
                "todayUsers": 0,
                "totalRevenue": 0.0
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
            "name": user.Name or "Unknown",
            "email": user.Email or "",
            "mobile": user.Mobile or "",
            "status": "Active" if user.IsActive else "Blocked",
            "joinDate": user.CreatedAt.strftime("%Y-%m-%d") if user.CreatedAt else ""
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
                func.date(Transactions.CreatedAt) == day).count()
            daily_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "transactions": count
            })

        return {"daily": daily_data, "monthly": []}
