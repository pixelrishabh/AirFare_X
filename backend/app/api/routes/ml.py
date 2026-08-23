from fastapi import APIRouter, Depends
from app.api.deps import require_role
from app.ml.predictor import predictor

router = APIRouter()

@router.post("/predict")
async def predict(payload: dict, role: str = Depends(require_role)):
    return predictor.predict(payload)
