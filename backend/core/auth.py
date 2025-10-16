"""
Authentication and Authorization utilities
Note: Mutations (POST/PUT/DELETE) are disabled until proper auth is implemented
"""
from fastapi import HTTPException, Depends, Header
from typing import Optional

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Placeholder for authentication
    TODO: Implement JWT authentication
    """
    # For now, return None - auth not implemented
    return None

async def require_admin(current_user = Depends(get_current_user)):
    """
    Require admin role for mutations
    TODO: Implement role-based access control
    """
    # For now, reject all mutations until auth is implemented
    raise HTTPException(
        status_code=501, 
        detail={
            "status": "error",
            "error": {
                "code": "NOT_IMPLEMENTED",
                "message": "Mutations are disabled. Authentication required."
            }
        }
    )
