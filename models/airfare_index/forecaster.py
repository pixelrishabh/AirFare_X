import os
import pandas as pd


INPUT_FILE = "data/processed/historical_airfare_index.csv"
OUTPUT_FILE = "data/processed/airfare_forecast.csv"


# ==========================================
# LOAD HISTORICAL INDEX
# ==========================================

df = pd.read_csv(INPUT_FILE)

df["date"] = pd.to_datetime(df["date"])

df = df.sort_values("date").reset_index(drop=True)

print("Historical observations:", len(df))

print(
    "Date range:",
    df["date"].min(),
    "to",
    df["date"].max()
)


# ==========================================
# CREATE TIME FEATURES
# ==========================================

df["day_number"] = (
    df["date"] - df["date"].min()
).dt.days

df["day_of_week"] = (
    df["date"].dt.dayofweek
)


# ==========================================
# LAG FEATURES
# ==========================================

df["lag_1"] = (
    df["airfare_index"].shift(1)
)

df["lag_3"] = (
    df["airfare_index"].shift(3)
)

df["lag_7"] = (
    df["airfare_index"].shift(7)
)


# ==========================================
# ROLLING FEATURES
# ==========================================

df["rolling_mean_3"] = (
    df["airfare_index"]
    .rolling(3)
    .mean()
)

df["rolling_mean_7"] = (
    df["airfare_index"]
    .rolling(7)
    .mean()
)


# ==========================================
# REMOVE ROWS WITH MISSING FEATURES
# ==========================================

model_data = df.dropna().copy()


# ==========================================
# DISPLAY
# ==========================================

print("\nForecasting dataset:")

print(
    model_data[
        [
            "date",
            "airfare_index",
            "lag_1",
            "lag_3",
            "lag_7",
            "rolling_mean_3",
            "rolling_mean_7"
        ]
    ].head(10)
)


print(
    "\nRows available for forecasting:",
    len(model_data)
)


# ==========================================
# MACHINE LEARNING FORECASTING
# ==========================================

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np


FEATURES = [
    "lag_1",
    "lag_3",
    "lag_7",
    "rolling_mean_3",
    "rolling_mean_7",
    "day_of_week"
]

TARGET = "airfare_index"


# ==========================================
# TRAIN / TEST SPLIT
# ==========================================
# IMPORTANT:
# Time-series data must NOT be randomly shuffled.

split_index = int(
    len(model_data) * 0.8
)

train = model_data.iloc[:split_index]
test = model_data.iloc[split_index:]


X_train = train[FEATURES]
y_train = train[TARGET]

X_test = test[FEATURES]
y_test = test[TARGET]


print("\nTraining rows:", len(train))
print("Testing rows:", len(test))


# ==========================================
# MODEL
# ==========================================

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=5,
    random_state=42
)

model.fit(
    X_train,
    y_train
)


# ==========================================
# PREDICTION
# ==========================================

predictions = model.predict(
    X_test
)


# ==========================================
# EVALUATION
# ==========================================

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)


print("\n" + "=" * 55)
print("AIRFARE FORECAST MODEL")
print("=" * 55)

print(
    "MAE:",
    round(mae, 2)
)

print(
    "RMSE:",
    round(rmse, 2)
)

# ==========================================
# SAVE MODEL METRICS
# ==========================================

metrics = pd.DataFrame({
    "metric": [
        "MAE",
        "RMSE"
    ],
    "value": [
        mae,
        rmse
    ]
})

metrics.to_csv(
    "data/processed/forecast_metrics.csv",
    index=False
)

print(
    "\nForecast metrics saved to:",
    "data/processed/forecast_metrics.csv"
)

# ==========================================
# CREATE FORECAST OUTPUT
# ==========================================

forecast = test[
    [
        "date",
        "airfare_index"
    ]
].copy()

forecast["predicted_index"] = predictions


print("\nForecast results:")

print(
    forecast
)

forecast.to_csv(
    OUTPUT_FILE,
    index=False
)

print(
    "\nForecast saved to:",
    OUTPUT_FILE
)