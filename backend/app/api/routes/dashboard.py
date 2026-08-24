import os
import sys
import subprocess
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime

from app.core.data_loader import load_csv, apply_filters, to_json_safe, clear_cache
from app.api.deps import optional_authenticated, require_admin, AuthenticatedUser
from app.ml.predictor import predictor

router = APIRouter()

ROOT_DIR = Path(__file__).resolve().parents[4]
PIPELINE_SCRIPT = ROOT_DIR / "run_pipeline.py"
if not PIPELINE_SCRIPT.exists():
    PIPELINE_SCRIPT = Path(__file__).resolve().parents[2] / "run_pipeline.py"

@router.get("/overview")
async def get_overview(user=Depends(optional_authenticated)):
    df_index = load_csv("airfare_index.csv")
    df_routes = load_csv("route_analysis.csv")
    df_airlines = load_csv("airline_analysis.csv")
    
    current_index = 128.64
    avg_fare = 5842.0
    if not df_index.empty and "apix_value" in df_index.columns:
        current_index = float(df_index["apix_value"].iloc[-1])
        if "avg_fare" in df_index.columns:
            avg_fare = float(df_index["avg_fare"].iloc[-1])

    return {
        "status": "ok",
        "current_index": current_index,
        "base_period": "January 2026 = 100",
        "avg_domestic_fare": avg_fare,
        "active_routes_count": len(df_routes) if not df_routes.empty else 25,
        "active_airlines_count": len(df_airlines) if not df_airlines.empty else 5,
        "data_freshness": datetime.now().isoformat(),
        "ml_model_status": predictor.status,
    }

@router.get("/index")
async def get_index(user=Depends(optional_authenticated)):
    df = load_csv("airfare_index.csv")
    return to_json_safe(df)

@router.get("/routes")
async def get_routes(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("route_analysis.csv")
    df = apply_filters(df, {"origin": origin, "destination": destination})
    return to_json_safe(df)

@router.get("/airlines")
async def get_airlines(
    airline: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("airline_analysis.csv")
    df = apply_filters(df, {"airline": airline})
    return to_json_safe(df)

@router.get("/route-airline")
async def get_route_airline(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    airline: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("route_airline_analysis.csv")
    df = apply_filters(df, {"origin": origin, "destination": destination, "airline": airline})
    return to_json_safe(df)

@router.get("/price-trend")
async def get_price_trend(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    airline: Optional[str] = None,
    booking_window: Optional[int] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("price_trend.csv")
    df = apply_filters(df, {"origin": origin, "destination": destination, "airline": airline, "booking_window": booking_window})
    return to_json_safe(df)

@router.get("/anomalies")
async def get_anomalies(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    airline: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("dashboard_anomalies.csv")
    df = apply_filters(df, {"origin": origin, "destination": destination, "airline": airline})
    return to_json_safe(df)

@router.get("/historical-trend")
async def get_historical_trend(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("historical_price_trend.csv")
    df = apply_filters(df, {"origin": origin, "destination": destination})
    if start_date and "date" in df.columns and not df.empty:
        df = df[df["date"] >= start_date]
    if end_date and "date" in df.columns and not df.empty:
        df = df[df["date"] <= end_date]
    return to_json_safe(df)

@router.get("/historical-index")
async def get_historical_index(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("historical_airfare_index.csv")
    if start_date and "date" in df.columns and not df.empty:
        df = df[df["date"] >= start_date]
    if end_date and "date" in df.columns and not df.empty:
        df = df[df["date"] <= end_date]
    return to_json_safe(df)

@router.get("/historical-booking")
async def get_historical_booking(
    booking_window: Optional[int] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("historical_booking_window.csv")
    df = apply_filters(df, {"booking_window": booking_window})
    return to_json_safe(df)

@router.get("/historical-route-analysis")
async def get_historical_route_analysis(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("historical_route_analysis.csv")
    df = apply_filters(df, {"origin": origin, "destination": destination})
    return to_json_safe(df)

@router.get("/historical-airline-analysis")
async def get_historical_airline_analysis(
    airline: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("historical_airline_analysis.csv")
    df = apply_filters(df, {"airline": airline})
    return to_json_safe(df)

@router.get("/forecast")
async def get_forecast(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    user=Depends(optional_authenticated),
):
    df = load_csv("airfare_forecast.csv")
    df = apply_filters(df, {"origin": origin, "destination": destination})
    return to_json_safe(df)

@router.get("/forecast-metrics")
async def get_forecast_metrics(user=Depends(optional_authenticated)):
    df = load_csv("forecast_metrics.csv")
    return to_json_safe(df)

@router.post("/data/refresh")
async def refresh_dashboard_cache(user=Depends(optional_authenticated)):
    clear_cache()
    return {
        "status": "success",
        "message": "Dashboard CSV in-memory cache cleared successfully.",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/pipeline/run")
async def trigger_pipeline_run(user=Depends(optional_authenticated)):
    try:
        cmd = [sys.executable, str(PIPELINE_SCRIPT)]
        process = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=90,
            check=False,
            cwd=str(PIPELINE_SCRIPT.parent)
        )
        
        # Clear in-memory cache immediately so new CSVs are read
        clear_cache()

        if process.returncode != 0:
            error_msg = process.stderr or process.stdout or "Pipeline process returned non-zero exit code."
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Pipeline execution failed: {error_msg}"
            )

        return {
            "status": "completed",
            "message": "AirFareX pipeline executed successfully. All 13 dashboard CSV datasets and ML model refreshed.",
            "timestamp": datetime.now().isoformat(),
            "output_log": process.stdout[-500:] if process.stdout else ""
        }
    except subprocess.TimeoutExpired:
        clear_cache()
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Pipeline execution timed out after 90 seconds."
        )
    except HTTPException:
        raise
    except Exception as e:
        clear_cache()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing pipeline: {str(e)}"
        )