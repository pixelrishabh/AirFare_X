from fastapi import Header, HTTPException
from app.core.supabase_client import supabase_admin

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    async def __call__(self, authorization: str = Header(...)) -> str:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        
        token = authorization.replace("Bearer ", "").strip()
        try:
            user_resp = supabase_admin.auth.get_user(token)
            if not user_resp or not user_resp.user:
                raise HTTPException(status_code=401, detail="Invalid or expired token")

            profile = (
                supabase_admin.table("profiles")
                .select("role")
                .eq("id", user_resp.user.id)
                .single()
                .execute()
            )
            role = profile.data.get("role") if profile.data else None

            if role not in self.allowed_roles:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return role
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

require_role = RoleChecker(["ADMIN", "ANALYST"])
require_admin = RoleChecker(["ADMIN"])
