from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import scraper, index, ml, dashboard

app = FastAPI(
    title="AirFareX Backend API",
    description="Real-Time Indian Domestic Airfare Price Index & Forecasting Intelligence Platform",
    version="1.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(scraper.router, prefix="/api/scraper", tags=["scraper"])
app.include_router(index.router, prefix="/api/index", tags=["index"])
app.include_router(ml.router, prefix="/api/ml", tags=["ml"])

@app.get("/")
def root():
    return {
        "service": "AirFareX Backend API",
        "status": "online",
        "version": "1.4.0",
        "docs_url": "http://127.0.0.1:8000/docs",
        "endpoints": {
            "overview": "http://127.0.0.1:8000/api/overview",
            "airfare_forecast": "http://127.0.0.1:8000/api/forecast",
            "forecast_metrics": "http://127.0.0.1:8000/api/forecast-metrics",
            "national_index": "http://127.0.0.1:8000/api/index",
            "routes_analysis": "http://127.0.0.1:8000/api/routes",
            "airlines_analysis": "http://127.0.0.1:8000/api/airlines",
            "route_airline": "http://127.0.0.1:8000/api/route-airline",
            "price_trend": "http://127.0.0.1:8000/api/price-trend",
            "anomalies": "http://127.0.0.1:8000/api/anomalies",
            "ml_status": "http://127.0.0.1:8000/api/ml/status",
            "health": "http://127.0.0.1:8000/health"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "AirFareX Backend"}