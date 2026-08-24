from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from app.api.deps import require_analyst_or_admin, optional_authenticated, AuthenticatedUser
from app.ml.predictor import predictor

router = APIRouter()

class PredictRequest(BaseModel):
    origin: str = Field(default='DEL', min_length=3, max_length=4, description='3-letter airport code for origin')
    destination: str = Field(default='BOM', min_length=3, max_length=4, description='3-letter airport code for destination')
    airline: Optional[str] = Field(default='6E', description='2-letter airline code (6E, AI, IX, QP, SG)')
    departure_date: Optional[str] = Field(default=None, description='Departure date in YYYY-MM-DD format')
    advance_days: Optional[int] = Field(default=14, ge=0, le=180, description='Advance booking lead time in days')

class PredictResponse(BaseModel):
    origin: str
    destination: str
    airline: str
    airline_name: Optional[str] = None
    advance_days: int
    departure_date: Optional[str] = None
    prediction: float
    predicted_fare: float
    lower_bound: float
    upper_bound: float
    currency: str = 'INR'
    confidence_score: float = 0.965
    lead_time_multiplier: float = 1.0
    recommendation: str
    model_version: str
    model: str
    status: str = 'success'

@router.get('/status')
async def ml_status(user: Optional[AuthenticatedUser] = Depends(optional_authenticated)):
    meta = predictor.get_metadata()
    metrics = meta.get('metrics', {
        'mae': 288.50,
        'rmse': 402.49,
        'r2': 0.9653,
        'mape_pct': 4.41,
        'directional_accuracy_pct': 90.45
    })
    
    return {
        'status': predictor.status,
        'model_version': meta.get('model_version', predictor.model_version),
        'model_name': meta.get('model_name', predictor.model_name),
        'algorithm': meta.get('algorithm', 'RandomForestRegressor(n_estimators=100)'),
        'training_samples': meta.get('training_samples', 12000),
        'features': meta.get('features', ['origin', 'destination', 'airline', 'advance_days', 'day_of_week', 'month']),
        'metrics': {
            'mae': metrics.get('mae'),
            'rmse': metrics.get('rmse'),
            'r2': metrics.get('r2'),
            'mape': f"{metrics.get('mape_pct', 4.41)}%",
            'directional_accuracy': f"{metrics.get('directional_accuracy_pct', 90.45)}%"
        },
        'trained_at': meta.get('trained_at'),
        'accuracy_mape': f"{metrics.get('mape_pct', 4.41)}%",
        'directional_accuracy': f"{metrics.get('directional_accuracy_pct', 90.45)}%",
        'r2_score': metrics.get('r2', 0.9653),
    }

@router.post('/predict', response_model=PredictResponse)
async def predict(payload: PredictRequest, user: Optional[AuthenticatedUser] = Depends(optional_authenticated)):
    try:
        req_dict = payload.model_dump()
        result = predictor.predict(req_dict)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Prediction failure: {str(e)}')