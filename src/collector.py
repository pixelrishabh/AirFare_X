import os
import json
from datetime import datetime, date
import sys


import pandas as pd
import serpapi
from dotenv import load_dotenv


# ==================================================
# CONFIGURATION
# ==================================================

ROUTES_FILE = "data/routes.csv"

RAW_FOLDER = "data/raw"

OBSERVATIONS_FILE = (
    "data/processed/observations.csv"
)

# Flight departure date that we are searching
if len(sys.argv) > 1:
    DEPARTURE_DATE = sys.argv[1]
else:
    DEPARTURE_DATE = "2026-08-25"

# ==================================================
# LOAD API KEY
# ==================================================

load_dotenv()

API_KEY = os.getenv("SERPAPI_KEY")

if not API_KEY:
    raise ValueError(
        "SERPAPI_KEY not found in .env file"
    )


# ==================================================
# CREATE SERPAPI CLIENT
# ==================================================

client = serpapi.Client(
    api_key=API_KEY
)


# ==================================================
# CREATE DIRECTORIES
# ==================================================

os.makedirs(
    RAW_FOLDER,
    exist_ok=True
)

os.makedirs(
    "data/processed",
    exist_ok=True
)


# ==================================================
# LOAD ROUTES
# ==================================================

routes = pd.read_csv(
    ROUTES_FILE
)

print("=" * 60)
print("AIRFARE DATA COLLECTION")
print("=" * 60)

print(
    f"Routes to search: {len(routes)}"
)

print(
    f"Departure date: {DEPARTURE_DATE}"
)


# ==================================================
# COLLECTION TIMESTAMP
# ==================================================

collection_time = datetime.now()

collection_timestamp = (
    collection_time.isoformat()
)

departure_date_obj = datetime.strptime(
    DEPARTURE_DATE,
    "%Y-%m-%d"
).date()

days_to_departure = (
    departure_date_obj - collection_time.date()
).days

print(
    f"Collection time: {collection_timestamp}"
)


# ==================================================
# STORE NEW OBSERVATIONS
# ==================================================

observations = []


# ==================================================
# LOOP THROUGH ROUTES
# ==================================================

for _, route in routes.iterrows():

    origin = str(
        route["origin"]
    ).strip().upper()

    destination = str(
        route["destination"]
    ).strip().upper()


    print("\n" + "-" * 50)

    print(
        f"Searching {origin} → {destination}"
    )


    # ==================================================
    # API PARAMETERS
    # ==================================================

    params = {

        "engine": "google_flights",

        "gl": "in",

        "hl": "en",

        "departure_id": origin,

        "arrival_id": destination,

        "outbound_date": DEPARTURE_DATE,

        "currency": "INR",

        "type": "2",

        "travel_class": "1",

        "adults": "1"
    }


    try:

        # ==============================================
        # CALL SERPAPI
        # ==============================================

        results = client.search(
            params
        )

        results_dict = dict(
            results
        )


        # ==============================================
        # SAVE RAW RESPONSE
        # ==============================================

        timestamp = (
            collection_time.strftime(
                "%Y%m%d_%H%M%S"
            )
        )

        filename = (
            f"{timestamp}_"
            f"{origin}_"
            f"{destination}.json"
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


        print(
            f"Raw data saved: {filename}"
        )


        # ==============================================
        # GET BEST FLIGHTS
        # ==============================================

        flights = results_dict.get(
            "best_flights",
            []
        )


        print(
            f"Flights found: {len(flights)}"
        )


        # ==============================================
        # EXTRACT EACH FLIGHT
        # ==============================================

        for flight in flights:

            price = flight.get(
                "price"
            )


            segments = flight.get(
                "flights",
                []
            )


            if not segments:
                continue


            # ------------------------------------------
            # FIRST SEGMENT
            # ------------------------------------------

            first_segment = segments[0]


            # ------------------------------------------
            # LAST SEGMENT
            # ------------------------------------------

            last_segment = segments[-1]


            # ------------------------------------------
            # AIRLINE
            # ------------------------------------------

            airline = first_segment.get(
                "airline",
                "Unknown"
            )


            # ------------------------------------------
            # FLIGHT NUMBER
            # ------------------------------------------

            flight_number = first_segment.get(
                "flight_number",
                "Unknown"
            )


            # ------------------------------------------
            # DEPARTURE AIRPORT
            # ------------------------------------------

            departure_airport = (
                first_segment.get(
                    "departure_airport",
                    {}
                )
            )


            # ------------------------------------------
            # ARRIVAL AIRPORT
            # ------------------------------------------

            arrival_airport = (
                last_segment.get(
                    "arrival_airport",
                    {}
                )
            )


            # ------------------------------------------
            # TIMES
            # ------------------------------------------

            departure_time = (
                departure_airport.get(
                    "time"
                )
            )

            arrival_time = (
                arrival_airport.get(
                    "time"
                )
            )


            # ------------------------------------------
            # STOPS
            # ------------------------------------------

            stops = flight.get(
                "stops",
                0
            )


            # ------------------------------------------
            # STORE OBSERVATION
            # ------------------------------------------

            observations.append({

                "collected_at":
                    collection_timestamp,

                "departure_date":
                    DEPARTURE_DATE,

                "days_to_departure":
                    days_to_departure,

                "origin":
                    origin,

                "destination":
                    destination,

                "route":
                    f"{origin}-{destination}",

                "airline":
                    airline,

                "flight_number":
                    flight_number,

                "departure_time":
                    departure_time,

                "arrival_time":
                    arrival_time,

                "price":
                    price,

                "currency":
                    "INR",

                "travel_class":
                    "Economy",

                "stops":
                    stops,

                "source":
                    "SerpApi Google Flights"

            })


    except Exception as error:

        print(
            f"ERROR: {origin} → {destination}"
        )

        print(
            error
        )


# ==================================================
# CREATE NEW DATAFRAME
# ==================================================

new_data = pd.DataFrame(
    observations
)


# ==================================================
# APPEND TO EXISTING DATA
# ==================================================

if os.path.exists(
    OBSERVATIONS_FILE
):

    old_data = pd.read_csv(
        OBSERVATIONS_FILE
    )

    combined_data = pd.concat(
        [
            old_data,
            new_data
        ],
        ignore_index=True
    )

else:

    combined_data = new_data


# ==================================================
# REMOVE EXACT DUPLICATES
# ==================================================

combined_data = (
    combined_data.drop_duplicates()
)


# ==================================================
# SAVE OBSERVATIONS
# ==================================================

combined_data.to_csv(
    OBSERVATIONS_FILE,
    index=False
)


# ==================================================
# FINAL SUMMARY
# ==================================================

print("\n")

print("=" * 60)
print("COLLECTION COMPLETE")
print("=" * 60)

print(
    f"New observations: {len(new_data)}"
)

print(
    f"Total observations: {len(combined_data)}"
)

print(
    f"Saved to: {OBSERVATIONS_FILE}"
)