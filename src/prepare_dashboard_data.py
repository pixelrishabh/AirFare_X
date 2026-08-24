import os
import shutil

SOURCE = "data/processed"
DESTINATIONS = ["data/dashboard", "backend/data/dashboard"]

FILES = [
    # ==============================
    # CURRENT / LIVE DATA
    # ==============================
    "airfare_index.csv",
    "route_analysis.csv",
    "airline_analysis.csv",
    "route_airline_analysis.csv",
    "price_trend.csv",
    "dashboard_anomalies.csv",

    # ==============================
    # HISTORICAL DATA
    # ==============================
    "historical_price_trend.csv",
    "historical_airfare_index.csv",
    "historical_booking_window.csv",
    "historical_route_analysis.csv",
    "historical_airline_analysis.csv",

    # ==============================
    # FORECASTING
    # ==============================
    "airfare_forecast.csv",
    "forecast_metrics.csv",
]

# ==========================================
# CREATE DASHBOARD DIRECTORIES
# ==========================================
for dest in DESTINATIONS:
    os.makedirs(dest, exist_ok=True)

# ==========================================
# COPY FILES
# ==========================================
print("=" * 60)
print("PREPARING DASHBOARD DATA")
print("=" * 60)

for filename in FILES:
    source_path = os.path.join(SOURCE, filename)
    if os.path.exists(source_path):
        for dest in DESTINATIONS:
            destination_path = os.path.join(dest, filename)
            shutil.copy2(source_path, destination_path)
        print(f"OK: {filename}")
    else:
        print(f"WARNING: {filename} NOT FOUND")

print("\n" + "=" * 60)
print("DASHBOARD DATA PREPARATION COMPLETE")
print("=" * 60)
print("\nDashboard directories:", DESTINATIONS)