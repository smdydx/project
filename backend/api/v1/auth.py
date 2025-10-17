
from fastapi import APIRouter, HTTPException, status
from core.auth import LoginRequest, LoginResponse, authenticate_user, create_access_token

router = APIRouter(tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login endpoint - returns JWT token
    """
    if not authenticate_user(request.username, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"username": request.username}
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=request.username
    )

@router.post("/verify")
async def verify_token(token: str):
    """
    Verify if token is valid
    """
    from core.auth import verify_token
    
    token_data = verify_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return {
        "valid": True,
        "username": token_data.username,
        "expires": token_data.exp
    }
