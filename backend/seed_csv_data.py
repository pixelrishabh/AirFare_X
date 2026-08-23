import pandas as pd
from pathlib import Path
import random
from datetime import date, timedelta

data_dir = Path(r"c:\Users\Rishabh\OneDrive\Desktop\sih26\backend\data\dashboard")
data_dir.mkdir(parents=True, exist_ok=True)

dates_30 = [(date.today() - timedelta(days=i)).isoformat() for i in range(29, -1, -1)]

# 1. airfare_index.csv
df_index = pd.DataFrame({
    "date": dates_30,
    "apix_value": [round(128.64 + (i * 0.15) + (random.random() * 2 - 1), 2) for i in range(30)],
    "dgca_ref": [round(126.80 + (i * 0.14) + (random.random() * 1.5 - 0.75), 2) for i in range(30)],
    "avg_fare": [round(5840 + (i * 12) + random.randint(-80, 80), 2) for i in range(30)],
})
df_index.to_csv(data_dir / "airfare_index.csv", index=False)

# 2. route_analysis.csv
routes = [
    ("DEL", "BOM", "Delhi", "Mumbai", 1148, 5650, 4100, 11200, 2.4),
    ("DEL", "BLR", "Delhi", "Bengaluru", 1740, 6890, 4800, 13500, 4.1),
    ("BOM", "BLR", "Mumbai", "Bengaluru", 842, 4920, 3400, 9800, 1.8),
    ("DEL", "CCU", "Delhi", "Kolkata", 1305, 5980, 4200, 11800, -1.2),
    ("BLR", "HYD", "Bengaluru", "Hyderabad", 500, 3850, 2600, 7800, 0.5),
    ("MAA", "DEL", "Chennai", "Delhi", 1760, 6720, 4600, 13200, 3.2),
    ("DEL", "HYD", "Delhi", "Hyderabad", 1250, 5450, 3900, 10900, 1.5),
    ("BOM", "DEL", "Mumbai", "Delhi", 1148, 5720, 4150, 11400, 2.2),
]

df_routes = pd.DataFrame(routes, columns=[
    "origin", "destination", "origin_city", "destination_city", "distance_km",
    "avg_fare", "min_fare", "max_fare", "weekly_change"
])
df_routes.to_csv(data_dir / "route_analysis.csv", index=False)

# 3. airline_analysis.csv
airlines = [
    ("6E", "IndiGo", 5420, 3800, 12500, 62.4, 94.2),
    ("AI", "Air India", 6150, 4200, 14800, 24.8, 88.5),
    ("IX", "Air India Express", 4890, 3400, 10200, 6.2, 89.1),
    ("QP", "Akasa Air", 5120, 3600, 11000, 4.5, 91.4),
    ("SG", "SpiceJet", 5310, 3500, 11800, 2.1, 84.7),
]
df_airlines = pd.DataFrame(airlines, columns=[
    "airline_code", "airline", "avg_fare", "min_fare", "max_fare", "market_share", "on_time_perf"
])
df_airlines.to_csv(data_dir / "airline_analysis.csv", index=False)

# 4. route_airline_analysis.csv
route_airline_rows = []
for r in routes:
    for a in airlines:
        route_airline_rows.append({
            "origin": r[0],
            "destination": r[1],
            "airline": a[1],
            "airline_code": a[0],
            "avg_fare": round(r[5] * (0.95 if a[0] == "6E" else 1.08 if a[0] == "AI" else 0.98), 2),
            "flight_count": random.randint(3, 14),
        })
df_route_airline = pd.DataFrame(route_airline_rows)
df_route_airline.to_csv(data_dir / "route_airline_analysis.csv", index=False)

# 5. price_trend.csv
trend_rows = []
for r in routes[:4]:
    for a in airlines[:3]:
        for bw in [1, 7, 15, 30, 45]:
            base = r[5] * (1.8 if bw == 1 else 1.35 if bw == 7 else 1.0 if bw == 15 else 0.82 if bw == 30 else 0.75)
            trend_rows.append({
                "origin": r[0],
                "destination": r[1],
                "airline": a[1],
                "booking_window": bw,
                "fare": round(base * (0.96 if a[0] == "6E" else 1.05), 2),
                "source": "IndiGo.com" if a[0] == "6E" else "AirIndia.in" if a[0] == "AI" else "MakeMyTrip"
            })
df_price_trend = pd.DataFrame(trend_rows)
df_price_trend.to_csv(data_dir / "price_trend.csv", index=False)

# 6. dashboard_anomalies.csv
anomalies = [
    ("DEL", "BLR", "IndiGo", "2026-08-28", 12400, 6890, "Festival Surge (+80%)"),
    ("BOM", "DEL", "Air India", "2026-08-27", 13800, 5720, "Capacity Constraint (+141%)"),
    ("DEL", "CCU", "SpiceJet", "2026-08-26", 3200, 5980, "Flash Discount (-46%)"),
    ("BLR", "HYD", "Akasa Air", "2026-08-25", 7900, 3850, "Monsoon Disruption (+105%)"),
]
df_anomalies = pd.DataFrame(anomalies, columns=[
    "origin", "destination", "airline", "date", "observed_fare", "baseline_fare", "anomaly_reason"
])
df_anomalies.to_csv(data_dir / "dashboard_anomalies.csv", index=False)

# 7. historical_price_trend.csv
hist_trend = []
for d in dates_30:
    hist_trend.append({
        "date": d,
        "origin": "DEL",
        "destination": "BOM",
        "avg_fare": round(5400 + random.randint(-150, 180), 2),
        "min_fare": 4100,
        "max_fare": 11200,
    })
df_hist_trend = pd.DataFrame(hist_trend)
df_hist_trend.to_csv(data_dir / "historical_price_trend.csv", index=False)

# 8. historical_airfare_index.csv
df_index.to_csv(data_dir / "historical_airfare_index.csv", index=False)

# 9. historical_booking_window.csv
bw_rows = [
    {"booking_window": 1, "avg_fare": 9850, "multiplier": 1.75},
    {"booking_window": 3, "avg_fare": 8400, "multiplier": 1.49},
    {"booking_window": 7, "avg_fare": 6920, "multiplier": 1.23},
    {"booking_window": 14, "avg_fare": 5640, "multiplier": 1.00},
    {"booking_window": 30, "avg_fare": 4820, "multiplier": 0.85},
    {"booking_window": 45, "avg_fare": 4350, "multiplier": 0.77},
    {"booking_window": 60, "avg_fare": 4100, "multiplier": 0.73},
]
df_bw = pd.DataFrame(bw_rows)
df_bw.to_csv(data_dir / "historical_booking_window.csv", index=False)

# 10. historical_route_analysis.csv
df_routes.to_csv(data_dir / "historical_route_analysis.csv", index=False)

# 11. historical_airline_analysis.csv
df_airlines.to_csv(data_dir / "historical_airline_analysis.csv", index=False)

# 12. airfare_forecast.csv
forecast_rows = []
for i in range(1, 15):
    d = (date.today() + timedelta(days=i)).isoformat()
    base = 129.50 + (i * 0.2)
    forecast_rows.append({
        "date": d,
        "origin": "DEL",
        "destination": "BOM",
        "forecast_index": round(base, 2),
        "lower_bound": round(base - 2.5, 2),
        "upper_bound": round(base + 2.5, 2),
        "actual_index": round(base + random.uniform(-0.8, 0.8), 2) if i <= 3 else None,
    })
df_forecast = pd.DataFrame(forecast_rows)
df_forecast.to_csv(data_dir / "airfare_forecast.csv", index=False)

# 13. forecast_metrics.csv
metrics_rows = [
    {"metric": "MAE (Mean Absolute Error)", "value": 1.42, "unit": "index points", "benchmark_status": "Passed (<2.0)"},
    {"metric": "RMSE (Root Mean Square Error)", "value": 1.86, "unit": "index points", "benchmark_status": "Passed (<2.5)"},
    {"metric": "MAPE (Mean Absolute % Error)", "value": "1.12%", "unit": "%", "benchmark_status": "Passed (<2.0%)"},
    {"metric": "Directional Accuracy", "value": "94.6%", "unit": "%", "benchmark_status": "Passed (>90%)"},
]
df_metrics = pd.DataFrame(metrics_rows)
df_metrics.to_csv(data_dir / "forecast_metrics.csv", index=False)

print("All 13 dashboard CSV files successfully created in backend/data/dashboard/")
