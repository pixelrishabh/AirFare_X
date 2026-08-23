from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.data_loader import load_csv, apply_filters, to_json_safe
from app.api.deps import optional_authenticated

router = APIRouter()

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
