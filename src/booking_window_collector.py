import os
import json
from datetime import datetime

import pandas as pd
import serpapi
from dotenv import load_dotenv


# ==========================================
# LOAD API KEY
# ==========================================

load_dotenv()

API_KEY = os.getenv("SERPAPI_KEY")

if not API_KEY:
    raise ValueError("SERPAPI_KEY not found in .env")


client = serpapi.Client(api_key=API_KEY)


# ==========================================
# FILES
# ==========================================

ROUTES_FILE = "data/routes.csv"
DATES_FILE = "data/search_dates.csv"

RAW_FOLDER = "data/raw/booking_windows"


# ==========================================
# CREATE FOLDER
# ==========================================

os.makedirs(RAW_FOLDER, exist_ok=True)


# ==========================================
# READ INPUT FILES
# ==========================================

routes = pd.read_csv(ROUTES_FILE)
dates = pd.read_csv(DATES_FILE)

print(f"Routes: {len(routes)}")
print(f"Booking windows: {len(dates)}")

total_searches = len(routes) * len(dates)

print(f"Total API searches required: {total_searches}")


# ==========================================
# COLLECT
# ==========================================

for _, route in routes.iterrows():

    origin = route["origin"]
    destination = route["destination"]

    for _, date_row in dates.iterrows():

        days_before = int(
            date_row["days_to_departure"]
        )

        departure_date = date_row[
            "departure_date"
        ]

        print("\n" + "=" * 60)

        print(
            f"Route: {origin} → {destination}"
        )

        print(
            f"Departure date: {departure_date}"
        )

        print(
            f"Booking window: {days_before} days"
        )

        print("=" * 60)


        params = {

            "engine": "google_flights",

            "gl": "in",

            "hl": "en",

            "departure_id": origin,

            "arrival_id": destination,

            "outbound_date": departure_date,

            "currency": "INR",

            "type": "2",

            "travel_class": "1",

            "adults": "1"
        }


        try:

            results = client.search(params)

            results_dict = dict(results)


            # ------------------------------
            # SAVE RAW RESPONSE
            # ------------------------------

            timestamp = datetime.now().strftime(
                "%Y%m%d_%H%M%S"
            )

            filename = (
                f"{timestamp}_"
                f"{origin}_{destination}_"
                f"{days_before}days.json"
            )

            filepath = os.path.join(
                RAW_FOLDER,
                filename
            )


            with open(
                filepath,
                "w",
                encoding="utf-8"
            ) as file:

                json.dump(
                    results_dict,
                    file,
                    indent=2,
                    ensure_ascii=False
                )


            # ------------------------------
            # CHECK RESULT
            # ------------------------------

            flights = results_dict.get(
                "best_flights",
                []
            )

            print(
                f"Flights found: {len(flights)}"
            )

            print(
                f"Saved: {filepath}"
            )


        except Exception as e:

            print(
                f"ERROR: {origin} → {destination}"
            )

            print(
                f"Window: {days_before} days"
            )

            print(e)


print("\n")
print("=" * 60)
print("BOOKING-WINDOW COLLECTION COMPLETE")
print("=" * 60)