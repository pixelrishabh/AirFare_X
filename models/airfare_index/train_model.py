import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

MODEL_DIR = Path(__file__).parent / 'models'
MODEL_PATH = MODEL_DIR / 'airfare_model.joblib'

ROUTES = [
    ('DEL', 'BOM', 5650, 4100, 11200),
    ('DEL', 'BLR', 6890, 4800, 13500),
    ('BOM', 'BLR', 4920, 3400, 9800),
    ('DEL', 'CCU', 5980, 4200, 11800),
    ('BLR', 'HYD', 3850, 2600, 7800),
    ('MAA', 'DEL', 6720, 4600, 13200),
    ('DEL', 'HYD', 5450, 3900, 10900),
    ('BOM', 'DEL', 5720, 4150, 11400),
    ('DEL', 'PNQ', 5200, 3800, 10500),
    ('BOM', 'CCU', 6400, 4500, 12800),
    ('BLR', 'DEL', 6800, 4750, 13400),
    ('HYD', 'DEL', 5400, 3850, 10800),
]

AIRLINES = {
    '6E': 0.96,   # IndiGo
    'AI': 1.08,   # Air India
    'IX': 0.92,   # Air India Express
    'QP': 0.94,   # Akasa Air
    'SG': 0.97,   # SpiceJet
}

def generate_training_data(n_samples: int = 15000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    rows = []
    
    for _ in range(n_samples):
        route = ROUTES[np.random.choice(len(ROUTES))]
        origin, destination, avg_fare, min_fare, max_fare = route
        airline = np.random.choice(list(AIRLINES.keys()))
        advance_days = int(np.random.exponential(scale=18))
        advance_days = min(max(advance_days, 0), 90)
        
        day_of_week = np.random.randint(0, 7)
        month = np.random.randint(1, 13)
        
        # Lead time multiplier curve
        if advance_days <= 1:
            lead_mult = 1.82
        elif advance_days <= 3:
            lead_mult = 1.55
        elif advance_days <= 7:
            lead_mult = 1.30
        elif advance_days <= 21:
            lead_mult = 1.00
        elif advance_days <= 45:
            lead_mult = 0.84
        else:
            lead_mult = 0.76
            
        airline_mult = AIRLINES.get(airline, 1.0)
        dow_mult = 1.08 if day_of_week in [4, 6] else 0.96
        season_mult = 1.12 if month in [10, 11, 12, 5] else 0.97
        
        base = avg_fare * lead_mult * airline_mult * dow_mult * season_mult
        noise = np.random.normal(0, base * 0.04)
        price = round(float(np.clip(base + noise, min_fare, max_fare * 1.3)), 2)
        
        rows.append({
            'origin': origin,
            'destination': destination,
            'airline': airline,
            'advance_days': advance_days,
            'day_of_week': day_of_week,
            'month': month,
            'price': price
        })
        
    return pd.DataFrame(rows)

def train_and_save_model():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    df = generate_training_data(n_samples=15000)
    
    feature_cols = ['origin', 'destination', 'airline', 'advance_days', 'day_of_week', 'month']
    X = df[feature_cols]
    y = df['price']
    
    cat_cols = ['origin', 'destination', 'airline']
    num_cols = ['advance_days', 'day_of_week', 'month']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols),
            ('num', StandardScaler(), num_cols)
        ]
    )
    
    model_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
    ])
    
    # Train-Test Split validation
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    model_pipeline.fit(X_train, y_train)
    y_pred = model_pipeline.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    
    print(f'=== ML MODEL TRAINING METRICS ===')
    print(f'MAE:  INR {mae:.2f}')
    print(f'RMSE: INR {rmse:.2f}')
    print(f'R2:   {r2:.4f}')
    print(f'MAPE: {mape:.2f}%')
    
    # Fit full pipeline & save
    model_pipeline.fit(X, y)
    joblib.dump(model_pipeline, MODEL_PATH)
    print(f'Saved trained model artifact to: {MODEL_PATH}')
    return model_pipeline

if __name__ == '__main__':
    train_and_save_model()
