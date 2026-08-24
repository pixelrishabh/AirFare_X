import os
from fastapi import Header, HTTPException, status
from typing import Optional, List
from app.core.supabase_client import supabase_admin

# Production default: DEMO_MODE is FALSE. Real Supabase auth is mandatory.
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() in ["true", "1", "yes"]

class AuthenticatedUser:
    def __init__(self, id: str, email: str, role: str, name: str = ""):
        self.id = id
        self.email = email
        self.role = role.upper()
        self.name = name or email.split("@")[0]
        self.user_metadata = {"role": self.role, "name": self.name}

async def get_current_user(authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty or invalid Bearer token"
        )

    # In explicit DEMO_MODE only, permit isolated test tokens
    if DEMO_MODE:
        token_lower = token.lower()
        if "admin" in token_lower:
            return AuthenticatedUser("demo-admin-1", "admin.test@airfarex.com", "ADMIN", "Administrator")
        elif "analyst" in token_lower:
            return AuthenticatedUser("demo-analyst-1", "analyst.test@airfarex.com", "ANALYST", "Data Analyst")
        elif "viewer" in token_lower or "guest" in token_lower:
            return AuthenticatedUser("demo-viewer-1", "viewer.test@airfarex.com", "VIEWER", "Guest Viewer")

    # Authoritative production verification via Supabase
    try:
        user_resp = supabase_admin.auth.get_user(token)
        if user_resp and user_resp.user:
            user = user_resp.user
            user_id = user.id
            email = user.email or ""
            role = "VIEWER"

            # Query authoritative profiles table for role
            try:
                profile = (
                    supabase_admin.table("profiles")
                    .select("name, role")
                    .eq("id", user_id)
                    .single()
                    .execute()
                )
                if profile.data:
                    if profile.data.get("role"):
                        role = profile.data.get("role")
                    if profile.data.get("name"):
                        name = profile.data.get("name")
            except Exception:
                pass

            if role == "VIEWER" and user.user_metadata and user.user_metadata.get("role"):
                role = user.user_metadata.get("role")

            return AuthenticatedUser(
                id=user_id,
                email=email,
                role=role,
                name=user.user_metadata.get("name", email.split("@")[0])
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token"
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication verification failed"
    )

async def require_authenticated(authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
    return await get_current_user(authorization)

async def optional_authenticated(authorization: Optional[str] = Header(None)) -> Optional[AuthenticatedUser]:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [r.upper() for r in allowed_roles]

    async def __call__(self, authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
        user = await get_current_user(authorization)
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {self.allowed_roles}, Current role: {user.role}"
            )
        return user

require_admin = RoleChecker(["ADMIN"])
require_analyst_or_admin = RoleChecker(["ADMIN", "ANALYST"])
require_role = require_analyst_or_admin