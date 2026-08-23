from datetime import date
from app.core.supabase_client import supabase_admin
from postgrest.exceptions import APIError

BASE_PERIOD_INDEX = 100.0        # Base index = 100.0 (January 2026)
BASE_PERIOD_AVG_FARE = 5840.0     # Reference baseline average fare in INR

def compute_index_real() -> dict:
    try:
        quotes = supabase_admin.table('fare_quotes').select('route_id, total_fare').execute().data
    except APIError as e:
        return {
            "apix_value": None,
            "status": "pending_schema_seed",
            "note": "Supabase tables not found. Run supabase/step7_schema.sql in your Supabase SQL Editor first.",
            "error_code": e.code,
        }
    except Exception as e:
        return {
            "apix_value": None,
            "status": "error",
            "note": f"Index computation error: {str(e)}",
        }

    if not quotes:
        return {"apix_value": None, "note": "no fare_quotes found"}

    route_totals: dict[str, list[float]] = {}
    for q in quotes:
        if q.get("total_fare") is not None:
            route_totals.setdefault(q["route_id"], []).append(float(q["total_fare"]))

    if not route_totals:
        return {"apix_value": None, "note": "no valid total_fare values found in quotes"}

    route_avgs = [sum(fares) / len(fares) for fares in route_totals.values()]
    overall_avg_fare = sum(route_avgs) / len(route_avgs)

    # Option 2: Compute real moving index relative to January 2026 base period snapshot
    apix_value = round(BASE_PERIOD_INDEX * (overall_avg_fare / BASE_PERIOD_AVG_FARE), 2)

    today = date.today().isoformat()
    try:
        supabase_admin.table('index_history').upsert({
            "value_date": today,
            "apix_value": apix_value,
            "avg_fare": round(overall_avg_fare, 2),
        }, on_conflict="value_date").execute()
    except Exception as e:
        return {
            "apix_value": apix_value,
            "avg_fare": round(overall_avg_fare, 2),
            "note": f"Computed index but failed to write index_history: {str(e)}",
        }

    return {
        "apix_value": apix_value,
        "avg_fare": round(overall_avg_fare, 2),
        "base_period_avg": BASE_PERIOD_AVG_FARE,
        "routes_counted": len(route_totals),
        "value_date": today,
    }
