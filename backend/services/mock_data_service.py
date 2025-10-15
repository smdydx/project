
"""
In-Memory Mock Data Service
Temporary data storage for development/testing
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random

class MockDataService:
    """Service for managing in-memory mock data"""
    
    @staticmethod
    def get_dashboard_stats() -> Dict[str, Any]:
        """Get mock dashboard statistics"""
        return {
            "total_users": 1247,
            "new_users_today": 23,
            "kyc_pending": 45,
            "kyc_verified": 1180,
            "prime_users": 567,
            "total_lcr_money": 125000.50,
            "total_prime_rewards": 45000.75,
            "mobile_recharges": 3456,
            "dth_recharges": 890
        }
    
    @staticmethod
    def get_live_transactions() -> List[Dict[str, Any]]:
        """Get mock live transactions"""
        services = ["Mobile Recharge", "DTH Recharge", "Bill Payment", "Money Transfer"]
        statuses = ["SUCCESS", "PENDING", "FAILED"]
        
        transactions = []
        for i in range(10):
            transactions.append({
                "id": f"TXN{1000 + i}",
                "user_name": f"User {random.randint(100, 999)}",
                "service": random.choice(services),
                "amount": round(random.uniform(100, 5000), 2),
                "status": random.choice(statuses),
                "timestamp": (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat()
            })
        
        return transactions
    
    @staticmethod
    def get_recent_users() -> List[Dict[str, Any]]:
        """Get mock recent users"""
        users = []
        for i in range(10):
            users.append({
                "id": f"USR{2000 + i}",
                "name": f"New User {random.randint(100, 999)}",
                "email": f"user{random.randint(100, 999)}@example.com",
                "phone": f"98765{random.randint(10000, 99999)}",
                "kyc_status": random.choice(["Pending", "Verified", "Rejected"]),
                "registered_at": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat()
            })
        
        return users
    
    @staticmethod
    def get_chart_data() -> Dict[str, Any]:
        """Get mock chart data"""
        # Last 7 days transaction volume
        daily_data = []
        for i in range(7, 0, -1):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            daily_data.append({
                "date": date,
                "volume": random.randint(50000, 150000)
            })
        
        # Service distribution
        service_distribution = [
            {"name": "Mobile Recharge", "value": 45},
            {"name": "DTH Recharge", "value": 25},
            {"name": "Bill Payment", "value": 20},
            {"name": "Money Transfer", "value": 10}
        ]
        
        return {
            "daily_transactions": daily_data,
            "service_distribution": service_distribution
        }
