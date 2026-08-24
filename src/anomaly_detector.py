import os
import pandas as pd
from sklearn.ensemble import IsolationForest


# ==========================================
# FILES
# ==========================================

INPUT_FILE = "data/processed/observations.csv"
OUTPUT_FILE = "data/processed/anomalies.csv"


# ==========================================
# LOAD DATA
# ==========================================

df = pd.read_csv(INPUT_FILE)

print("Original observations:", len(df))


# ==========================================
# CLEAN DATA
# ==========================================

df["price"] = pd.to_numeric(
    df["price"],
    errors="coerce"
)

df["days_to_departure"] = pd.to_numeric(
    df["days_to_departure"],
    errors="coerce"
)

df = df.dropna(
    subset=["price", "route"]
)

df = df[df["price"] > 0]


# ==========================================
# DEFAULT VALUES
# ==========================================

df["anomaly_prediction"] = 1
df["anomaly_score"] = 0.0
df["is_anomaly"] = False
df["anomaly_type"] = "normal"


# ==========================================
# ROUTE-WISE ANOMALY DETECTION
# ==========================================

for route, route_data in df.groupby("route"):

    print(f"\nAnalyzing route: {route}")

    # Need enough observations
    if len(route_data) < 5:
        print("Not enough data — skipped")
        continue

    features = route_data[
        [
            "price",
            "days_to_departure"
        ]
    ].copy()

    # Fill missing booking windows
    features["days_to_departure"] = (
        features["days_to_departure"]
        .fillna(
            features["days_to_departure"].median()
        )
    )

    model = IsolationForest(
        contamination=0.10,
        random_state=42
    )

    model.fit(features)

    predictions = model.predict(features)

    scores = model.decision_function(features)

    # Save results back to original dataframe
    df.loc[
        route_data.index,
        "anomaly_prediction"
    ] = predictions

    df.loc[
        route_data.index,
        "anomaly_score"
    ] = scores


# ==========================================
# ANOMALY FLAG
# ==========================================

df["is_anomaly"] = (
    df["anomaly_prediction"] == -1
)


# ==========================================
# ANOMALY TYPE
# ==========================================

for route, route_data in df.groupby("route"):

    route_median = route_data["price"].median()

    high_price = (
        (df.index.isin(route_data.index))
        & (df["is_anomaly"])
        & (df["price"] > route_median)
    )

    low_price = (
        (df.index.isin(route_data.index))
        & (df["is_anomaly"])
        & (df["price"] < route_median)
    )

    df.loc[
        high_price,
        "anomaly_type"
    ] = "high_price"

    df.loc[
        low_price,
        "anomaly_type"
    ] = "low_price"


# ==========================================
# SORT
# ==========================================

df = df.sort_values(
    "anomaly_score"
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

total = len(df)

anomalies = int(
    df["is_anomaly"].sum()
)

print("\n" + "=" * 50)
print("ROUTE-WISE ANOMALY DETECTION COMPLETE")
print("=" * 50)

print("Total observations:", total)

print("Anomalies detected:", anomalies)

print(
    "Anomaly percentage:",
    round(
        anomalies / total * 100,
        2
    ),
    "%"
)

print("\nAnomalies by route:")

print(
    df[df["is_anomaly"]]
    .groupby("route")
    .size()
)


print("\nTop anomalies:")

print(
    df[df["is_anomaly"]][
        [
            "route",
            "airline",
            "price",
            "days_to_departure",
            "anomaly_type",
            "anomaly_score"
        ]
    ].head(20)
)

print(
    "\nSaved to:",
    OUTPUT_FILE
)