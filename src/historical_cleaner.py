import os
import pandas as pd


INPUT_FILE = "data/historical/Clean_Dataset.csv"
OUTPUT_FILE = "data/processed/historical_clean.csv"


# ==========================================
# LOAD
# ==========================================

df = pd.read_csv(INPUT_FILE)

print("Original rows:", len(df))
print("Original columns:", df.columns.tolist())


# ==========================================
# REMOVE UNNECESSARY COLUMN
# ==========================================

if "Unnamed: 0" in df.columns:
    df = df.drop(columns=["Unnamed: 0"])


# ==========================================
# CREATE ROUTE
# ==========================================

df["route"] = (
    df["source_city"].astype(str)
    + "-"
    + df["destination_city"].astype(str)
)


# ==========================================
# CLEAN PRICE
# ==========================================

df["price"] = pd.to_numeric(
    df["price"],
    errors="coerce"
)


# ==========================================
# CLEAN DAYS LEFT
# ==========================================

df["days_left"] = pd.to_numeric(
    df["days_left"],
    errors="coerce"
)


# ==========================================
# REMOVE INVALID RECORDS
# ==========================================

df = df.dropna(
    subset=[
        "airline",
        "source_city",
        "destination_city",
        "price",
        "days_left"
    ]
)

df = df[df["price"] > 0]
df = df[df["days_left"] >= 0]


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
print("HISTORICAL DATA CLEANING COMPLETE")
print("=" * 50)

print("Rows after cleaning:", len(df))

print("\nColumns:")
print(df.columns.tolist())

print("\nRoutes:", df["route"].nunique())

print("Airlines:", df["airline"].nunique())

print(
    "Days-left range:",
    df["days_left"].min(),
    "to",
    df["days_left"].max()
)

print(
    "\nSaved to:",
    OUTPUT_FILE
)