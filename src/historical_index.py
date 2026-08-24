import os
import pandas as pd


INPUT_FILE = "data/historical/economy.csv"
OUTPUT_FILE = "data/processed/historical_airfare_index.csv"


# ==========================================
# LOAD
# ==========================================

df = pd.read_csv(INPUT_FILE)

print("Original rows:", len(df))


# ==========================================
# CLEAN PRICE
# ==========================================

df["price"] = (
    df["price"]
    .astype(str)
    .str.replace(",", "", regex=False)
)

df["price"] = pd.to_numeric(
    df["price"],
    errors="coerce"
)


# ==========================================
# CLEAN DATE
# ==========================================

df["date"] = pd.to_datetime(
    df["date"],
    dayfirst=True,
    errors="coerce"
)


# ==========================================
# CREATE ROUTE
# ==========================================

df["route"] = (
    df["from"].astype(str)
    + "-"
    + df["to"].astype(str)
)


# ==========================================
# REMOVE INVALID DATA
# ==========================================

df = df.dropna(
    subset=[
        "date",
        "route",
        "price"
    ]
)

df = df[df["price"] > 0]


# ==========================================
# DAILY ROUTE MEDIAN
# ==========================================

route_daily = (
    df.groupby(
        [
            "date",
            "route"
        ]
    )["price"]
    .median()
    .reset_index()
)

route_daily = route_daily.rename(
    columns={
        "price": "median_fare"
    }
)


# ==========================================
# BASE DATE
# ==========================================

base_date = route_daily["date"].min()

print("Base date:", base_date)


# ==========================================
# BASE FARES
# ==========================================

base_fares = (
    route_daily[
        route_daily["date"] == base_date
    ][
        [
            "route",
            "median_fare"
        ]
    ]
    .rename(
        columns={
            "median_fare": "base_fare"
        }
    )
)


# ==========================================
# MERGE BASE
# ==========================================

route_index = route_daily.merge(
    base_fares,
    on="route",
    how="left"
)


# ==========================================
# REMOVE ROUTES WITHOUT BASE
# ==========================================

route_index = route_index.dropna(
    subset=["base_fare"]
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
# EQUAL ROUTE WEIGHTS
# ==========================================

number_of_routes = (
    route_index["route"]
    .nunique()
)

route_index["weight"] = (
    1 / number_of_routes
)


# ==========================================
# NATIONAL HISTORICAL INDEX
# ==========================================

historical_index = (
    route_index
    .groupby("date")
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
# SAVE
# ==========================================

os.makedirs(
    "data/processed",
    exist_ok=True
)

historical_index.to_csv(
    OUTPUT_FILE,
    index=False
)


# ==========================================
# DISPLAY
# ==========================================

print("\n" + "=" * 60)
print("HISTORICAL AIRFARE INDEX COMPLETE")
print("=" * 60)

print("\nHistorical index:")

print(
    historical_index.head(15)
)

print("\nLast values:")

print(
    historical_index.tail(10)
)

print(
    "\nSaved to:",
    OUTPUT_FILE
)