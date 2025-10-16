from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Numeric, or_
from datetime import datetime, timedelta
from decimal import Decimal
from models.models import User, Transactions
from models.payment_gateway import Payment_Gateway


class DashboardService:

    @staticmethod
    def get_dashboard_stats(db: Session):
        try:
            # Total users - excluding deleted
            total_users = db.query(User).filter(
                or_(User.IsDeleted == False, User.IsDeleted == None)
            ).count()
            
            # New signups today
            today = datetime.now().date()
            new_signups_today = db.query(User).filter(
                func.date(User.CreatedAt) == today,
                or_(User.IsDeleted == False, User.IsDeleted == None)
            ).count()
            
            # KYC verified users
            kyc_verified_users = db.query(User).filter(
                User.IsKYCCompleted == True,
                or_(User.IsDeleted == False, User.IsDeleted == None)
            ).count()
            
            # KYC verification percentage
            kyc_verification_percentage = (
                (kyc_verified_users / total_users * 100) if total_users > 0 else 0
            )
            
            # Prime users
            prime_users = db.query(User).filter(
                User.prime_status == True,
                or_(User.IsDeleted == False, User.IsDeleted == None)
            ).count()
            
            # Total distributor LCR money (sum of INR wallet balance)
            lcr_money_sum = db.query(
                func.coalesce(func.sum(cast(User.INRWalletBalance, Numeric)), 0)
            ).filter(
                or_(User.IsDeleted == False, User.IsDeleted == None)
            ).scalar()
            total_lcr_money = float(lcr_money_sum) if lcr_money_sum else 0.0
            
            # Total distributor prime reward (sum of reward wallet balance)
            prime_reward_sum = db.query(
                func.coalesce(func.sum(cast(User.RewardWalletBalance, Numeric)), 0)
            ).filter(
                or_(User.IsDeleted == False, User.IsDeleted == None)
            ).scalar()
            total_prime_reward = float(prime_reward_sum) if prime_reward_sum else 0.0
            
            # Mobile recharge from Payment_Gateway - check multiple status variations
            total_mobile_recharge = db.query(Payment_Gateway).filter(
                or_(
                    Payment_Gateway.purpose.ilike('%mobile%'),
                    Payment_Gateway.purpose.ilike('%recharge%')
                ),
                or_(
                    Payment_Gateway.status.ilike('%success%'),
                    Payment_Gateway.status == 'SUCCESS',
                    Payment_Gateway.status == 'COMPLETED'
                )
            ).count()
            
            # DTH recharge from Payment_Gateway
            total_dth_recharge = db.query(Payment_Gateway).filter(
                Payment_Gateway.purpose.ilike('%dth%'),
                or_(
                    Payment_Gateway.status.ilike('%success%'),
                    Payment_Gateway.status == 'SUCCESS',
                    Payment_Gateway.status == 'COMPLETED'
                )
            ).count()

            # Calculate verified accounts (KYC completed users)
            verified_accounts = kyc_verified_users

            print(f"📊 Dashboard Stats Debug:")
            print(f"   Total Users: {total_users}")
            print(f"   New Signups Today: {new_signups_today}")
            print(f"   KYC Verified: {kyc_verified_users}")
            print(f"   Prime Users: {prime_users}")
            print(f"   LCR Money: {total_lcr_money}")
            print(f"   Prime Reward: {total_prime_reward}")
            print(f"   Mobile Recharge: {total_mobile_recharge}")
            print(f"   DTH Recharge: {total_dth_recharge}")

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
            print(f"❌ Error fetching dashboard stats: {e}")
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
        # Get from Payment_Gateway first
        pg_txns = db.query(Payment_Gateway).order_by(
            desc(Payment_Gateway.created_at)
        ).limit(limit).all()
        
        result = []
        for txn in pg_txns:
            result.append({
                "id": txn.client_txn_id or f"PG{txn.id}",
                "user": txn.payer_name or "Unknown",
                "service": txn.purpose or "Service",
                "amount": float(txn.amount) if txn.amount else 0.0,
                "status": txn.status or "Pending",
                "location": "India"
            })
        
        # If no Payment_Gateway data, try Transactions table
        if not result:
            transactions = db.query(Transactions).join(
                User, Transactions.UserID == User.UserID
            ).order_by(
                desc(Transactions.CreatedAt)
            ).limit(limit).all()
            
            for txn in transactions:
                result.append({
                    "id": str(txn.TransactionID),
                    "user": txn.user.fullname if txn.user else "Unknown",
                    "service": txn.TransactionType or "Transaction",
                    "amount": float(txn.Amount) if txn.Amount else 0.0,
                    "status": txn.Status or "Pending",
                    "location": "India"
                })
        
        return result

    @staticmethod
    def get_recent_users(db: Session, limit: int = 20):
        users = db.query(User).filter(
            or_(User.IsDeleted == False, User.IsDeleted == None)
        ).order_by(desc(User.CreatedAt)).limit(limit).all()

        result = []
        for user in users:
            # Determine role based on user attributes
            role = "Retailer"
            if user.prime_status:
                role = "Distributor"
            
            result.append({
                "id": str(user.UserID),
                "name": user.fullname or "Unknown User",
                "email": user.Email or "",
                "mobile": user.MobileNumber or "",
                "role": role,
                "location": "India",
                "device": "Mobile" if user.DeviceVerified else "Desktop",
                "registered_at": user.CreatedAt.isoformat() if user.CreatedAt else datetime.now().isoformat()
            })
        
        return result

    @staticmethod
    def get_chart_data(db: Session):
        last_7_days = [
            datetime.now().date() - timedelta(days=i)
            for i in range(6, -1, -1)
        ]

        daily_volume = []
        for day in last_7_days:
            # Use Payment_Gateway for transaction counts
            pg_count = db.query(Payment_Gateway).filter(
                func.date(Payment_Gateway.created_at) == day
            ).count()
            
            pg_amount = db.query(
                func.coalesce(func.sum(cast(Payment_Gateway.amount, Numeric)), 0)
            ).filter(
                func.date(Payment_Gateway.created_at) == day
            ).scalar() or 0
            
            # Also check Transactions table
            txn_count = db.query(Transactions).filter(
                func.date(Transactions.CreatedAt) == day,
                or_(Transactions.IsDeleted == False, Transactions.IsDeleted == None)
            ).count()
            
            txn_amount = db.query(
                func.coalesce(func.sum(Transactions.Amount), 0)
            ).filter(
                func.date(Transactions.CreatedAt) == day,
                or_(Transactions.IsDeleted == False, Transactions.IsDeleted == None)
            ).scalar() or 0
            
            # Combine both sources
            total_count = pg_count + txn_count
            total_amount = float(pg_amount) + float(txn_amount)
            
            daily_volume.append({
                "name": day.strftime("%b %d"),
                "transactions": total_count,
                "amount": total_amount
            })
        
        # Service distribution from Payment_Gateway
        pg_services = db.query(
            Payment_Gateway.purpose,
            func.count(Payment_Gateway.id).label('count')
        ).filter(
            Payment_Gateway.purpose.isnot(None)
        ).group_by(Payment_Gateway.purpose).all()
        
        # Also get from Transactions
        txn_services = db.query(
            Transactions.TransactionType,
            func.count(Transactions.TransactionID).label('count')
        ).filter(
            or_(Transactions.IsDeleted == False, Transactions.IsDeleted == None),
            Transactions.TransactionType.isnot(None)
        ).group_by(Transactions.TransactionType).all()
        
        # Merge service data
        service_map = {}
        for service, count in pg_services:
            service_name = service if service else "Other"
            service_map[service_name] = service_map.get(service_name, 0) + count
            
        for service, count in txn_services:
            service_name = service if service else "Other"
            service_map[service_name] = service_map.get(service_name, 0) + count
        
        colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
        service_distribution = [
            {
                "name": service_name,
                "value": float(count),
                "color": colors[i % len(colors)]
            }
            for i, (service_name, count) in enumerate(service_map.items())
        ]

        print(f"📈 Chart Data Debug:")
        print(f"   Daily Volume Days: {len(daily_volume)}")
        print(f"   Service Distribution: {len(service_distribution)} services")

        return {
            "daily_volume": daily_volume,
            "service_distribution": service_distribution if service_distribution else [
                {"name": "No Data", "value": 0, "color": "#9ca3af"}
            ]
        }
