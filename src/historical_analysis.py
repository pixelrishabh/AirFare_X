import os
import pandas as pd


INPUT_FILE = "data/processed/historical_clean.csv"

ROUTE_OUTPUT = "data/processed/historical_route_analysis.csv"
AIRLINE_OUTPUT = "data/processed/historical_airline_analysis.csv"


# ==========================================
# LOAD
# ==========================================

df = pd.read_csv(INPUT_FILE)

print("Historical rows:", len(df))


# ==========================================
# ROUTE ANALYSIS
# ==========================================

route_analysis = (
    df.groupby("route")["price"]
    .agg(
        count="count",
        mean="mean",
        median="median",
        minimum="min",
        maximum="max"
    )
    .reset_index()
    .sort_values(
        "median",
        ascending=True
    )
)


# ==========================================
# AIRLINE ANALYSIS
# ==========================================

airline_analysis = (
    df.groupby("airline")["price"]
    .agg(
        count="count",
        mean="mean",
        median="median",
        minimum="min",
        maximum="max"
    )
    .reset_index()
    .sort_values(
        "median",
        ascending=True
    )
)


# ==========================================
# SAVE
# ==========================================

os.makedirs(
    "data/processed",
    exist_ok=True
)

route_analysis.to_csv(
    ROUTE_OUTPUT,
    index=False
)

airline_analysis.to_csv(
    AIRLINE_OUTPUT,
    index=False
)


# ==========================================
# DISPLAY
# ==========================================

print("\n" + "=" * 60)
print("HISTORICAL ROUTE ANALYSIS")
print("=" * 60)

print("\nCheapest historical routes:")

print(
    route_analysis[
        [
            "route",
            "count",
            "median",
            "minimum"
        ]
    ].head(10)
)


print("\nMost expensive historical routes:")

print(
    route_analysis[
        [
            "route",
            "count",
            "median",
            "maximum"
        ]
    ].tail(10)
)


print("\n" + "=" * 60)
print("HISTORICAL AIRLINE ANALYSIS")
print("=" * 60)

print(
    airline_analysis[
        [
            "airline",
            "count",
            "median",
            "minimum",
            "maximum"
        ]
    ]
)


print("\nSaved files:")

print(ROUTE_OUTPUT)
print(AIRLINE_OUTPUT)