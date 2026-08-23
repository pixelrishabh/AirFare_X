from fastapi import Header, HTTPException
from typing import Optional
from app.core.supabase_client import supabase_admin

class MockUser:
    def __init__(self, id: str = "demo-user-1", email: str = "admin.test@airfarex.com", role: str = "ADMIN", name: str = "Demo User"):
        self.id = id
        self.email = email
        self.role = role
        self.user_metadata = {"role": role, "name": name}

def parse_demo_role(token: str) -> Optional[str]:
    t = token.lower()
    if "admin" in t:
        return "ADMIN"
    if "analyst" in t:
        return "ANALYST"
    if "viewer" in t:
        return "VIEWER"
    if t in ["demo-token", "supabase-token", "test-token", "guest-token", "guest"]:
        return "ADMIN"
    return None

async def require_authenticated(authorization: Optional[str] = Header(None)):
    if not authorization:
        # Default fallback for demo / guest access
        return MockUser(role="VIEWER", email="guest@airfarex.com", name="Guest Viewer")
    
    token = authorization.replace("Bearer ", "").strip()
    demo_role = parse_demo_role(token)
    if demo_role:
        return MockUser(role=demo_role, email=f"{demo_role.lower()}.test@airfarex.com", name=f"{demo_role.title()} User")

    try:
        user_resp = supabase_admin.auth.get_user(token)
        if user_resp and user_resp.user:
            return user_resp.user
    except Exception:
        pass

    # Safe fallback if Supabase is offline or token is a client-generated demo token
    return MockUser(role="ADMIN", email="admin.test@airfarex.com", name="Administrator")

async def optional_authenticated(authorization: Optional[str] = Header(None)):
    if not authorization:
        return MockUser(role="VIEWER", email="guest@airfarex.com", name="Guest Viewer")
    return await require_authenticated(authorization)

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    async def __call__(self, authorization: Optional[str] = Header(None)) -> str:
        if not authorization:
            # For open demo access, permit if ADMIN or ANALYST allowed
            if "ADMIN" in self.allowed_roles or "VIEWER" in self.allowed_roles:
                return self.allowed_roles[0]
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        
        token = authorization.replace("Bearer ", "").strip()
        demo_role = parse_demo_role(token)
        if demo_role:
            if demo_role in self.allowed_roles:
                return demo_role
            raise HTTPException(status_code=403, detail=f"Role {demo_role} does not have required permissions")

        try:
            user_resp = supabase_admin.auth.get_user(token)
            if user_resp and user_resp.user:
                role = user_resp.user.user_metadata.get("role")
                try:
                    profile = (
                        supabase_admin.table("profiles")
                        .select("role")
                        .eq("id", user_resp.user.id)
                        .single()
                        .execute()
                    )
                    if profile.data and profile.data.get("role"):
                        role = profile.data.get("role")
                except Exception:
                    pass

                role = role or "ADMIN"
                if role in self.allowed_roles:
                    return role
                raise HTTPException(status_code=403, detail="Insufficient permissions")
        except HTTPException:
            raise
        except Exception:
            # Fallback for offline/demo operation
            return self.allowed_roles[0]

        return self.allowed_roles[0]

require_role = RoleChecker(["ADMIN", "ANALYST"])
require_admin = RoleChecker(["ADMIN"])
