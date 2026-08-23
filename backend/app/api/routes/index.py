from fastapi import APIRouter, Depends
from app.api.deps import require_role
from app.index_calc.compute import compute_index_real

router = APIRouter()

@router.post("/compute")
async def compute_index(role: str = Depends(require_role)):
    result = compute_index_real()
    return {"status": "completed", "computed_by": role, **result}
