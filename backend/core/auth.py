"""
JWT Authentication and Authorization - Production Ready
"""
from typing import Optional
from fastapi import HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from core.config import settings

# JWT Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 days

security = HTTPBearer(auto_error=False)

class TokenData(BaseModel):
    username: str
    exp: datetime
    token_type: str = "access"

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    username: str
    expires_in: int

class RefreshRequest(BaseModel):
    refresh_token: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "token_type": "access",
        "iat": datetime.utcnow()
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({
        "exp": expire,
        "token_type": "refresh",
        "iat": datetime.utcnow()
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, expected_type: str = "access") -> Optional[TokenData]:
    """Verify JWT token and return token data"""
    try:
        print(f"🔍 Decoding token with SECRET_KEY (length: {len(SECRET_KEY)})")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        exp: int = payload.get("exp")
        token_type: str = payload.get("token_type", "access")

        print(f"📦 Token payload - username: {username}, type: {token_type}, exp: {exp}")

        if username is None:
            print("❌ No username in token")
            return None

        if token_type != expected_type:
            print(f"❌ Token type mismatch: expected {expected_type}, got {token_type}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {expected_type}, got {token_type}"
            )

        return TokenData(
            username=username,
            exp=datetime.fromtimestamp(exp),
            token_type=token_type
        )
    except jwt.ExpiredSignatureError as e:
        print(f"❌ Token expired: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError as e:
        print(f"❌ Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        print(f"❌ Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    authorization: Optional[str] = Header(None)
) -> TokenData:
    """Validate JWT token and return user data"""
    token = None

    # Try to get token from Authorization header
    if credentials:
        token = credentials.credentials
        print(f"🔑 Token from credentials: {token[:30]}...")
    elif authorization:
        # Handle "Bearer <token>" format
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
            print(f"🔑 Token from authorization header: {token[:30]}...")
        else:
            print(f"❌ Invalid authorization header format: {authorization}")
    else:
        print("❌ No credentials or authorization header found")

    if not token:
        print("❌ Authentication failed: No token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )

    print(f"🔍 Verifying token...")
    token_data = verify_token(token, "access")

    if token_data is None:
        print("❌ Token verification failed: Invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    print(f"✅ Token verified for user: {token_data.username}")
    return token_data

async def require_admin(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Require admin role for protected operations"""
    # All authenticated users are admins for now
    # Add role-based access control here when needed
    return current_user

def authenticate_user(username: str, password: str) -> bool:
    """Authenticate user credentials - loads from .env via Settings"""
    # Load admin credentials from Settings (validates they exist in .env)
    ADMIN_USERNAME = settings.ADMIN_USERNAME
    ADMIN_PASSWORD = settings.ADMIN_PASSWORD

    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD