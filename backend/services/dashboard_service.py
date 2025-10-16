
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from models.models import User
from models.payment_gateway import Payment_Gateway
from datetime import datetime, timedelta

class DashboardService:
    @staticmethod
    def get_dashboard_stats(db: Session):
        """Get dashboard statistics"""
        # Total users
        total_users = db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False
        ).scalar() or 0

        # Active users (KYC completed)
        kyc_verified_users = db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False,
            User.IsKYCCompleted == True
        ).scalar() or 0

        # Prime users
        prime_users = db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False,
            User.prime_status == True
        ).scalar() or 0

        # Total transactions
        total_transactions = db.query(func.count(Payment_Gateway.id)).scalar() or 0

        # Total LCR money (sum of all user wallet balances)
        total_lcr_money = db.query(func.sum(User.INRWalletBalance)).filter(
            User.IsDeleted == False
        ).scalar() or 0

        # Mobile and DTH recharges
        mobile_recharges = db.query(func.count(Payment_Gateway.id)).filter(
            Payment_Gateway.purpose.like('%mobile%')
        ).scalar() or 0
        
        dth_recharges = db.query(func.count(Payment_Gateway.id)).filter(
            Payment_Gateway.purpose.like('%DTH%')
        ).scalar() or 0

        # Today's registrations
        today = datetime.now().date()
        new_signups_today = db.query(func.count(User.UserID)).filter(
            User.IsDeleted == False,
            func.date(User.CreatedAt) == today
        ).scalar() or 0

        # Calculate prime rewards (247 per prime user)
        total_prime_rewards = prime_users * 247

        return {
            "total_users": total_users,
            "new_signups_today": new_signups_today,
            "kyc_verified_users": kyc_verified_users,
            "prime_users": prime_users,
            "total_transactions": total_transactions,
            "total_lcr_money": float(total_lcr_money),
            "total_distributor_lcr_money": float(total_lcr_money),
            "total_distributor_prime_reward": total_prime_rewards,
            "mobile_recharges": mobile_recharges,
            "dth_recharges": dth_recharges,
            "total_mobile_recharge": mobile_recharges,
            "total_dth_recharge": dth_recharges
        }

    @staticmethod
    def get_chart_data(db: Session):
        """Get chart data for dashboard"""
        # Last 7 days data
        seven_days_ago = datetime.now() - timedelta(days=7)
        
        # Get transaction data for last 7 days
        transaction_data = db.query(
            func.date(Payment_Gateway.created_at).label('date'),
            func.count(Payment_Gateway.id).label('count'),
            func.sum(Payment_Gateway.amount).label('amount')
        ).filter(
            Payment_Gateway.created_at >= seven_days_ago
        ).group_by(
            func.date(Payment_Gateway.created_at)
        ).all()

        # Format data for daily volume chart
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        daily_volume = []
        
        for i, day in enumerate(days):
            target_date = (datetime.now() - timedelta(days=6-i)).date()
            matching_data = next((t for t in transaction_data if t.date == target_date), None)
            daily_volume.append({
                "name": day,
                "transactions": matching_data.count if matching_data else 0,
                "amount": float(matching_data.amount) if matching_data and matching_data.amount else 0
            })

        # Service distribution
        service_distribution = [
            {"name": "Mobile", "value": 35, "color": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},
            {"name": "DTH", "value": 25, "color": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"},
            {"name": "Electricity", "value": 20, "color": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"},
            {"name": "Water", "value": 12, "color": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"},
            {"name": "Gas", "value": 8, "color": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"}
        ]

        return {
            "dailyVolume": daily_volume,
            "serviceDistribution": service_distribution
        }

    @staticmethod
    def get_recent_users(db: Session, limit: int = 20):
        """Get recently registered users"""
        users = db.query(User).filter(
            User.IsDeleted == False
        ).order_by(
            desc(User.CreatedAt)
        ).limit(limit).all()

        return [
            {
                "id": str(user.UserID),
                "name": user.fullname or f"User {user.UserID}",
                "role": "Prime User" if user.prime_status else "Regular User",
                "joined_on": user.CreatedAt.isoformat() if user.CreatedAt else datetime.now().isoformat(),
                "mobile": user.MobileNumber,
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

    @staticmethod
    def get_live_transactions(db: Session, limit: int = 50):
        """Get live transactions for dashboard"""
        transactions = db.query(Payment_Gateway).order_by(
            desc(Payment_Gateway.created_at)
        ).limit(limit).all()

        # Sample locations for demo
        locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]
        
        import random
        return [
            {
                "id": f"TXN{txn.id:06d}",
                "user": txn.payer_name or f"User{txn.id}",
                "service": txn.purpose or "Mobile Recharge",
                "amount": float(txn.amount) if txn.amount else 0,
                "status": "Success" if txn.status == "success" else "Pending" if txn.status == "pending" else "Failed",
                "location": random.choice(locations),
                "timestamp": txn.created_at.isoformat() if txn.created_at else datetime.now().isoformat()
            }
            for txn in transactions
        ]
