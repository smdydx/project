
"""
Database Index Optimization Script
Run this ONCE to add indexes for faster queries on transactions
"""

from sqlalchemy import create_engine, text
from core.config import settings

def create_optimized_indexes():
    """Create database indexes for faster query performance"""
    engine = create_engine(settings.DATABASE_URL)
    
    indexes = [
        # Service Request indexes
        "CREATE INDEX IF NOT EXISTS idx_service_request_reference ON service_request(reference_id)",
        "CREATE INDEX IF NOT EXISTS idx_service_request_user ON service_request(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_service_request_status ON service_request(status)",
        "CREATE INDEX IF NOT EXISTS idx_service_request_created ON service_request(created_at DESC)",
        
        # LCR Money indexes
        "CREATE INDEX IF NOT EXISTS idx_lcr_money_reference ON lcr_money(reference_id)",
        "CREATE INDEX IF NOT EXISTS idx_lcr_money_date ON lcr_money(transactiondate DESC)",
        
        # LCR Rewards indexes
        "CREATE INDEX IF NOT EXISTS idx_lcr_rewards_reference ON lcr_rewards(reference_id)",
        "CREATE INDEX IF NOT EXISTS idx_lcr_rewards_date ON lcr_rewards(transactiondate DESC)",
        
        # Payment Gateway indexes
        "CREATE INDEX IF NOT EXISTS idx_payment_gateway_service ON payment_gateway(service_request_id)",
        "CREATE INDEX IF NOT EXISTS idx_payment_gateway_created ON payment_gateway(created_at DESC)",
    ]
    
    with engine.connect() as conn:
        for idx_sql in indexes:
            try:
                conn.execute(text(idx_sql))
                print(f"✅ Created: {idx_sql.split('idx_')[1].split(' ')[0]}")
            except Exception as e:
                print(f"⚠️ Warning: {e}")
        conn.commit()
    
    print("\n✅ Database indexing completed!")

if __name__ == "__main__":
    create_optimized_indexes()
