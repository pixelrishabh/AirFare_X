import os
import json
import glob
import pandas as pd
from datetime import datetime


RAW_FOLDER = "data/raw"
OUTPUT_FILE = "data/processed/fares_clean.csv"


# ==========================================
# CREATE OUTPUT FOLDER
# ==========================================

os.makedirs("data/processed", exist_ok=True)


# ==========================================
# FIND ALL RAW JSON FILES
# ==========================================

files = glob.glob(
    os.path.join(RAW_FOLDER, "*.json")
)

print(f"Raw files found: {len(files)}")


all_rows = []


# ==========================================
# PROCESS EACH JSON FILE
# ==========================================

for file_path in files:

    print(f"\nProcessing: {file_path}")

    try:

        # ------------------------------
        # READ JSON
        # ------------------------------

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)


        # ------------------------------
        # GET BEST FLIGHTS
        # ------------------------------

        flights = data.get(
            "best_flights",
            []
        )


        if not flights:

            print("No best flights found.")

            continue


        # ------------------------------
        # PROCESS EACH FLIGHT
        # ------------------------------

        for flight in flights:

            price = flight.get("price")

            flight_segments = flight.get(
                "flights",
                []
            )


            if not flight_segments:

                continue


            # First segment
            first_segment = flight_segments[0]

            # Last segment
            last_segment = flight_segments[-1]


            # ------------------------------
            # AIRLINE
            # ------------------------------

            airline = first_segment.get(
                "airline",
                "Unknown"
            )


            # ------------------------------
            # FLIGHT NUMBER
            # ------------------------------

            flight_number = first_segment.get(
                "flight_number",
                "Unknown"
            )


            # ------------------------------
            # DEPARTURE
            # ------------------------------

            departure_airport = (
                first_segment
                .get("departure_airport", {})
            )

            departure_time = (
                departure_airport
                .get("time")
            )


            # ------------------------------
            # ARRIVAL
            # ------------------------------

            arrival_airport = (
                last_segment
                .get("arrival_airport", {})
            )

            arrival_time = (
                arrival_airport
                .get("time")
            )


            # ------------------------------
            # ROUTE
            # ------------------------------

            origin = (
                departure_airport
                .get("id")
            )

            destination = (
                arrival_airport
                .get("id")
            )


            # ------------------------------
            # STOPS
            # ------------------------------

            stops = flight.get(
                "stops",
                0
            )


            # ------------------------------
            # COLLECTED TIME
            # ------------------------------

            collected_at = datetime.now().isoformat()


            # ------------------------------
            # STORE RECORD
            # ------------------------------

            row = {

                "collected_at":
                    collected_at,

                "departure_date":
                    departure_time[:10]
                    if departure_time
                    else None,

                "origin":
                    origin,

                "destination":
                    destination,

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

            }


            all_rows.append(row)


    except Exception as e:

        print(
            f"ERROR processing {file_path}"
        )

        print(e)


# ==========================================
# CREATE DATAFRAME
# ==========================================

df = pd.DataFrame(all_rows)


# ==========================================
# BASIC CLEANING
# ==========================================

if not df.empty:

    # Remove rows without price
    df = df.dropna(
        subset=["price"]
    )


    # Convert price to numeric
    df["price"] = pd.to_numeric(
        df["price"],
        errors="coerce"
    )


    # Remove invalid prices
    df = df[
        df["price"] > 0
    ]


    # Remove duplicate observations
    df = df.drop_duplicates()


# ==========================================
# SAVE CLEAN DATA
# ==========================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ==========================================
# SUMMARY
# ==========================================

print("\n")
print("=" * 50)

print("CLEANING COMPLETE")

print("=" * 50)

print(
    f"Total clean records: {len(df)}"
)

print(
    f"Saved to: {OUTPUT_FILE}"
)


if not df.empty:

    print("\nSample data:")

    print(
        df.head()
    )