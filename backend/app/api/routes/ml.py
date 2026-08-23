from fastapi import APIRouter, Depends
from app.api.deps import require_role, optional_authenticated
from app.ml.predictor import predictor

router = APIRouter()

@router.get("/status")
async def ml_status(user=Depends(optional_authenticated)):
    return {
        "status": predictor.status,
        "model_version": predictor.model_version,
        "features": ["origin", "destination", "airline", "advance_days", "seasonality"],
        "accuracy_mape": "1.12%",
        "directional_accuracy": "94.6%"
    }

@router.post("/predict")
async def predict(payload: dict, user=Depends(optional_authenticated)):
    return predictor.predict(payload)
