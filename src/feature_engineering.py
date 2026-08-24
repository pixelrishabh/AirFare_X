import os
import pandas as pd


# ==========================================
# FILE PATHS
# ==========================================

INPUT_FILE = "data/processed/fares_clean.csv"

OUTPUT_FILE = (
    "data/processed/fares_features.csv"
)


# ==========================================
# LOAD DATA
# ==========================================

print("Loading fare dataset...")

df = pd.read_csv(INPUT_FILE)

print("Original shape:", df.shape)


# ==========================================
# CONVERT DATE/TIME COLUMNS
# ==========================================

df["collected_at"] = pd.to_datetime(
    df["collected_at"],
    errors="coerce"
)

df["departure_time"] = pd.to_datetime(
    df["departure_time"],
    errors="coerce"
)

df["arrival_time"] = pd.to_datetime(
    df["arrival_time"],
    errors="coerce"
)


# ==========================================
# CREATE COLLECTION DATE
# ==========================================

df["collection_date"] = (
    df["collected_at"].dt.date
)


# ==========================================
# CREATE COLLECTION TIME
# ==========================================

df["collection_time"] = (
    df["collected_at"].dt.time
)


# ==========================================
# CREATE DEPARTURE DATE
# ==========================================

df["flight_date"] = (
    df["departure_time"].dt.date
)


# ==========================================
# CREATE ROUTE
# ==========================================

df["route"] = (
    df["origin"]
    + "-"
    + df["destination"]
)


# ==========================================
# DAYS TO DEPARTURE
# ==========================================

df["days_to_departure"] = (
    pd.to_datetime(df["flight_date"])
    - pd.to_datetime(df["collection_date"])
).dt.days


# ==========================================
# DAY OF WEEK
# ==========================================

df["departure_day"] = (
    df["departure_time"]
    .dt.day_name()
)


# ==========================================
# DEPARTURE HOUR
# ==========================================

df["departure_hour"] = (
    df["departure_time"]
    .dt.hour
)


# ==========================================
# ARRIVAL HOUR
# ==========================================

df["arrival_hour"] = (
    df["arrival_time"]
    .dt.hour
)


# ==========================================
# WEEKDAY / WEEKEND
# ==========================================

df["is_weekend"] = (
    df["departure_time"]
    .dt.dayofweek >= 5
)


# ==========================================
# PRICE LOG
# ==========================================

df["log_price"] = (
    (df["price"] + 1).apply(
        lambda x: __import__("math").log(x)
    )
)


# ==========================================
# CLEAN INVALID VALUES
# ==========================================

df = df.dropna(
    subset=[
        "price",
        "origin",
        "destination",
        "route",
        "collection_date"
    ]
)


df = df[df["price"] > 0]


# ==========================================
# SORT DATA
# ==========================================

df = df.sort_values(
    by=[
        "collection_date",
        "route",
        "price"
    ]
)


# ==========================================
# SAVE
# ==========================================

os.makedirs(
    "data/processed",
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ==========================================
# SUMMARY
# ==========================================

print("\n" + "=" * 50)

print("FEATURE ENGINEERING COMPLETE")

print("=" * 50)

print("Final shape:", df.shape)

print(
    "Saved to:",
    OUTPUT_FILE
)

print("\nNew columns:")

print([
    "collection_date",
    "collection_time",
    "flight_date",
    "route",
    "days_to_departure",
    "departure_day",
    "departure_hour",
    "arrival_hour",
    "is_weekend",
    "log_price"
])

print("\nSample:")

print(
    df[
        [
            "collection_date",
            "flight_date",
            "route",
            "airline",
            "price",
            "days_to_departure"
        ]
    ].head(10)
)