from fastapi import APIRouter, Depends
from typing import Optional
from app.api.deps import require_admin, optional_authenticated, AuthenticatedUser
from app.index_calc.compute import compute_index_real

router = APIRouter()

@router.get("/summary")
async def get_index_summary(user: Optional[AuthenticatedUser] = Depends(optional_authenticated)):
    result = compute_index_real()
    return {"status": "ok", **result}

@router.post("/compute")
async def compute_index(user: AuthenticatedUser = Depends(require_admin)):
    result = compute_index_real()
    return {"status": "completed", "computed_by": user.email, "role": user.role, **result}