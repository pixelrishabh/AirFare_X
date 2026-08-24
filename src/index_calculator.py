import os
import pandas as pd


# ==========================================
# FILES
# ==========================================

INPUT_FILE = "data/processed/observations.csv"

OUTPUT_FILE = "data/processed/airfare_index.csv"


# ==========================================
# LOAD DATA
# ==========================================

df = pd.read_csv(INPUT_FILE)

df["price"] = pd.to_numeric(
    df["price"],
    errors="coerce"
)

df["days_to_departure"] = pd.to_numeric(
    df["days_to_departure"],
    errors="coerce"
)


# ==========================================
# CLEAN
# ==========================================

df = df.dropna(
    subset=[
        "route",
        "price",
        "days_to_departure"
    ]
)

df = df[df["price"] > 0]


# ==========================================
# ROUTE + BOOKING WINDOW FARE
# ==========================================

route_window = (
    df.groupby(
        [
            "days_to_departure",
            "route"
        ]
    )["price"]
    .median()
    .reset_index()
)

route_window = route_window.rename(
    columns={
        "price": "median_fare"
    }
)


# ==========================================
# BASE PERIOD
# ==========================================
# 30 days before departure is our
# prototype base period.
#
# Base index = 100

base_data = route_window[
    route_window["days_to_departure"] == 30
][
    [
        "route",
        "median_fare"
    ]
].rename(
    columns={
        "median_fare": "base_fare"
    }
)


# ==========================================
# MERGE BASE FARES
# ==========================================

route_index = route_window.merge(
    base_data,
    on="route",
    how="left"
)


# ==========================================
# ROUTE INDEX
# ==========================================

route_index["route_index"] = (
    route_index["median_fare"]
    / route_index["base_fare"]
    * 100
)


# ==========================================
# REMOVE ROUTES WITHOUT BASE FARE
# ==========================================

route_index = route_index.dropna(
    subset=["base_fare"]
)


# ==========================================
# ROUTE WEIGHTS
# ==========================================
# Prototype:
# equal weight for each route

number_of_routes = (
    route_index["route"]
    .nunique()
)

route_index["weight"] = (
    1 / number_of_routes
)


# ==========================================
# NATIONAL AIRFARE INDEX
# ==========================================

national_index = (
    route_index
    .groupby("days_to_departure")
    .apply(
        lambda x: (
            x["route_index"] *
            x["weight"]
        ).sum(),
        include_groups=False
    )
    .reset_index(
        name="airfare_index"
    )
)


# ==========================================
# MERGE NATIONAL INDEX
# ==========================================

route_index = route_index.merge(
    national_index,
    on="days_to_departure",
    how="left"
)


# ==========================================
# SAVE
# ==========================================

os.makedirs(
    "data/processed",
    exist_ok=True
)

route_index.to_csv(
    OUTPUT_FILE,
    index=False
)


# ==========================================
# DISPLAY
# ==========================================

print("\n" + "=" * 55)
print("BOOKING-WINDOW AIRFARE INDEX COMPLETE")
print("=" * 55)

print("\nNational Airfare Index:")
print(national_index)


print("\nRoute-level Index:")
print(
    route_index[
        [
            "days_to_departure",
            "route",
            "base_fare",
            "median_fare",
            "route_index",
            "airfare_index"
        ]
    ].head(30)
)


print(
    "\nSaved to:",
    OUTPUT_FILE
)