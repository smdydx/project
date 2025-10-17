
"""
JWT Authentication and Authorization
"""
from fastapi import HTTPException, Depends, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime, timedelta
import jwt
from pydantic import BaseModel

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production-lcrpay-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()

class TokenData(BaseModel):
    username: str
    exp: datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify JWT token and return token data"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        exp: int = payload.get("exp")
        
        if username is None:
            return None
            
        return TokenData(
            username=username,
            exp=datetime.fromtimestamp(exp)
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current authenticated user from JWT token
    """
    token = credentials.credentials
    token_data = verify_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_data

async def require_admin(current_user: TokenData = Depends(get_current_user)):
    """
    Require admin role for mutations
    """
    # For now, all authenticated users are admins
    # You can add role-based access control here
    return current_user

def authenticate_user(username: str, password: str) -> bool:
    """
    Authenticate user credentials
    TODO: Replace with database lookup
    """
    # Hardcoded credentials - replace with database lookup in production
    ADMIN_USERNAME = "LCRadmin"
    ADMIN_PASSWORD = "admin123smdydx1216"
    
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD
