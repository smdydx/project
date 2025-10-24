
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from core.database import get_db
from core.auth import get_current_user, TokenData
from models.models import User

router = APIRouter(tags=["referral"])

def build_referral_tree(user: User, db: Session, current_level: int = 0, max_depth: int = 10) -> Dict[str, Any]:
    """Recursively build referral tree"""
    if current_level >= max_depth:
        return None
    
    # Get all users referred by this user
    referred_users = db.query(User).filter(
        User.introducer_id == user.member_id,
        User.IsDeleted == False
    ).all()
    
    user_data = {
        "UserID": user.UserID,
        "fullname": user.fullname or f"User {user.UserID}",
        "member_id": user.member_id,
        "MobileNumber": user.MobileNumber,
        "Email": user.Email,
        "prime_status": user.prime_status,
        "referred_count": len(referred_users),
        "level": current_level,
        "referred_users": []
    }
    
    # Recursively build tree for referred users
    for ref_user in referred_users:
        child_tree = build_referral_tree(ref_user, db, current_level + 1, max_depth)
        if child_tree:
            user_data["referred_users"].append(child_tree)
    
    return user_data

@router.get("/{user_id}/referral-chain")
async def get_referral_chain(
    user_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete referral chain for a user"""
    try:
        user = db.query(User).filter(
            User.UserID == user_id,
            User.IsDeleted == False
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build the referral tree
        referral_tree = build_referral_tree(user, db)
        
        # Calculate total referrals recursively
        def count_referrals(node: Dict) -> int:
            count = len(node.get("referred_users", []))
            for child in node.get("referred_users", []):
                count += count_referrals(child)
            return count
        
        # Calculate max depth
        def get_max_depth(node: Dict, current_depth: int = 0) -> int:
            if not node.get("referred_users"):
                return current_depth
            return max(get_max_depth(child, current_depth + 1) for child in node["referred_users"])
        
        total_referrals = count_referrals(referral_tree)
        max_depth = get_max_depth(referral_tree)
        
        return {
            "userName": user.fullname or f"User {user.UserID}",
            "totalReferrals": total_referrals,
            "maxDepth": max_depth,
            "chain": [referral_tree]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
