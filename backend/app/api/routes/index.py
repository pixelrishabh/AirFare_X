from fastapi import APIRouter, Depends
from app.api.deps import require_role, optional_authenticated
from app.index_calc.compute import compute_index_real

router = APIRouter()

@router.get("/summary")
async def get_index_summary(user=Depends(optional_authenticated)):
    result = compute_index_real()
    return {"status": "ok", **result}

@router.post("/compute")
async def compute_index(role: str = Depends(require_role)):
    result = compute_index_real()
    return {"status": "completed", "computed_by": role, **result}
