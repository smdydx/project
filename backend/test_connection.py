
#!/usr/bin/env python3
"""
Simple test script to verify database and API setup
"""
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from backend.core.database import engine, SessionLocal
from backend.core.config import settings
from sqlalchemy import text

def test_database_connection():
    """Test database connection"""
    print("=" * 50)
    print("🔍 Testing Database Connection")
    print("=" * 50)
    
    print(f"\n📌 Database URL: {settings.DATABASE_URL}")
    
    try:
        # Test engine connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database engine connected successfully!")
            
        # Test session
        db = SessionLocal()
        try:
            # Try to query tables
            result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = result.fetchall()
            
            print(f"\n📊 Tables in database ({len(tables)}):")
            for table in tables:
                print(f"  - {table[0]}")
                
            # Count records in users table if exists
            if any('users' in str(t) for t in tables):
                count = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
                print(f"\n👥 Total users in database: {count}")
                
        finally:
            db.close()
            
        print("\n✅ All database tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Database connection failed: {str(e)}")
        return False

def test_models():
    """Test if models are importable"""
    print("\n" + "=" * 50)
    print("🔍 Testing Models Import")
    print("=" * 50)
    
    try:
        from backend.models import models
        print("✅ models.py imported successfully")
        
        from backend.models import payment_gateway
        print("✅ payment_gateway.py imported successfully")
        
        print("\n✅ All models imported successfully!")
        return True
    except Exception as e:
        print(f"❌ Model import failed: {str(e)}")
        return False

def test_api_endpoints():
    """Test API configuration"""
    print("\n" + "=" * 50)
    print("🔍 Testing API Configuration")
    print("=" * 50)
    
    try:
        from backend.main import app
        print(f"✅ FastAPI app created: {settings.PROJECT_NAME}")
        print(f"📌 API Prefix: {settings.API_V1_PREFIX}")
        print(f"📌 Version: {settings.VERSION}")
        
        print("\n📋 Available routes:")
        for route in app.routes:
            if hasattr(route, 'path'):
                print(f"  - {route.path}")
        
        print("\n✅ API configuration test passed!")
        return True
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting Backend Tests...\n")
    
    db_ok = test_database_connection()
    models_ok = test_models()
    api_ok = test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    print(f"Database: {'✅ PASS' if db_ok else '❌ FAIL'}")
    print(f"Models: {'✅ PASS' if models_ok else '❌ FAIL'}")
    print(f"API: {'✅ PASS' if api_ok else '❌ FAIL'}")
    
    if db_ok and models_ok and api_ok:
        print("\n🎉 All tests passed! Backend is ready.")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed. Please fix the issues above.")
        sys.exit(1)
