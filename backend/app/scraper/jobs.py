import random
from datetime import date, timedelta
from app.core.supabase_client import supabase_admin
from postgrest.exceptions import APIError

SOURCES = ['IndiGo.com', 'AirIndia.in', 'MakeMyTrip', 'Yatra', 'EaseMyTrip', 'Cleartrip', 'Ixigo', 'Goibibo']
ADVANCE_WINDOWS = [1, 7, 15, 30, 45]

def run_ingestion_job() -> dict:
    """
    Synthetic stand-in for a real scraper. Reads existing routes/airlines,
    generates realistic fare quotes, inserts them into fare_quotes.
    Swap this function's body for real scraping later — callers don't change.
    """
    try:
        routes = supabase_admin.table('routes').select('id').execute().data
        airlines = supabase_admin.table('airlines').select('id').execute().data
    except APIError as e:
        return {
            "inserted": 0,
            "status": "pending_schema_seed",
            "note": "Supabase tables not found. Run supabase/step7_schema.sql in your Supabase SQL Editor first.",
            "error_code": e.code,
        }
    except Exception as e:
        return {
            "inserted": 0,
            "status": "error",
            "note": f"Ingestion error: {str(e)}",
        }

    if not routes or not airlines:
        return {"inserted": 0, "note": "no routes/airlines found — run schema seed first"}

    rows = []
    for route in routes:
        for airline in airlines:
            base = random.uniform(3500, 9500)
            advance_days = random.choice(ADVANCE_WINDOWS)
            departure = date.today() + timedelta(days=random.randint(1, 60))
            taxes = round(base * 0.09, 2)
            udf = round(random.uniform(50, 150), 2)
            fee = round(random.uniform(100, 300), 2)

            rows.append({
                "route_id": route["id"],
                "airline_id": airline["id"],
                "departure_date": departure.isoformat(),
                "advance_days": advance_days,
                "fare_class": "Economy",
                "base_fare": round(base, 2),
                "taxes": taxes,
                "udf": udf,
                "convenience_fee": fee,
                "availability": random.randint(0, 9),
                "source": random.choice(SOURCES),
            })

    try:
        result = supabase_admin.table('fare_quotes').insert(rows).execute()
        return {"inserted": len(result.data or []), "routes": len(routes), "airlines": len(airlines)}
    except Exception as e:
        return {"inserted": 0, "error": str(e)}
