import os
import pandas as pd


BUSINESS_FILE = "data/historical/business.csv"
ECONOMY_FILE = "data/historical/economy.csv"

OUTPUT_FILE = "data/processed/historical_price_trend.csv"


# ==========================================
# LOAD DATA
# ==========================================

business = pd.read_csv(BUSINESS_FILE)
economy = pd.read_csv(ECONOMY_FILE)


# ==========================================
# ADD CLASS
# ==========================================

business["class"] = "Business"
economy["class"] = "Economy"


# ==========================================
# COMBINE
# ==========================================

df = pd.concat(
    [business, economy],
    ignore_index=True
)


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
        "price",
        "route",
        "airline"
    ]
)

df = df[df["price"] > 0]


# ==========================================
# DAILY HISTORICAL TREND
# ==========================================

historical_trend = (
    df.groupby("date")["price"]
    .agg(
        count="count",
        mean="mean",
        median="median",
        minimum="min",
        maximum="max"
    )
    .reset_index()
    .sort_values("date")
)


# ==========================================
# SAVE
# ==========================================

os.makedirs(
    "data/processed",
    exist_ok=True
)

historical_trend.to_csv(
    OUTPUT_FILE,
    index=False
)


# ==========================================
# DISPLAY
# ==========================================

print("\n" + "=" * 60)
print("HISTORICAL PRICE TREND")
print("=" * 60)

print(
    "\nDate range:",
    historical_trend["date"].min(),
    "to",
    historical_trend["date"].max()
)

print(
    "\nNumber of historical dates:",
    len(historical_trend)
)

print("\nFirst 10 days:")

print(
    historical_trend.head(10)
)

print("\nLast 10 days:")

print(
    historical_trend.tail(10)
)

print(
    "\nSaved to:",
    OUTPUT_FILE
)