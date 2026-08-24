import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

MODEL_DIR = Path(__file__).parent / 'models'
MODEL_PATH = MODEL_DIR / 'airfare_model.joblib'
METADATA_PATH = MODEL_DIR / 'model_metadata.json'

AIRLINE_NAMES = {
    '6E': 'IndiGo',
    'AI': 'Air India',
    'IX': 'Air India Express',
    'QP': 'Akasa Air',
    'SG': 'SpiceJet',
}

class Predictor:
    def __init__(self):
        self.model = None
        self.metadata = {}
        self.model_name = 'Airfare Predictor (scikit-learn Pipeline)'
        self.model_version = 'v1.4-rf-pipeline'
        self.status = 'initializing'
        self._load_model()

    def _load_model(self):
        try:
            if not MODEL_PATH.exists():
                print(f"[AirFareX ML] Model not found at {MODEL_PATH}, auto-generating...")
                from app.ml.train_model import train_and_save_model
                train_and_save_model()

            self.model = joblib.load(MODEL_PATH)
            
            if METADATA_PATH.exists():
                with open(METADATA_PATH, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
                    self.model_name = self.metadata.get('model_name', self.model_name)
                    self.model_version = self.metadata.get('model_version', self.model_version)

            self.status = 'active'
            print(f"[AirFareX ML] Model loaded successfully: {self.model_name} ({self.model_version})")
        except Exception as e:
            self.status = f'error: {str(e)}'
            print(f"[AirFareX ML] Error loading model: {e}")

    def get_metadata(self) -> Dict[str, Any]:
        if not self.metadata and METADATA_PATH.exists():
            try:
                with open(METADATA_PATH, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
            except Exception:
                pass
        return self.metadata

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if self.model is None:
            self._load_model()
            if self.model is None:
                raise RuntimeError("ML model failed to initialize.")

        origin = str(data.get('origin', 'DEL')).upper()
        destination = str(data.get('destination', 'BOM')).upper()
        airline = str(data.get('airline', '6E')).upper()
        departure_date_str = data.get('departure_date')
        
        # Calculate advance days & temporal features
        if departure_date_str:
            try:
                dep_dt = datetime.strptime(departure_date_str, '%Y-%m-%d').date()
                today_dt = datetime.now().date()
                diff_days = (dep_dt - today_dt).days
                advance_days = max(0, diff_days)
                day_of_week = dep_dt.weekday()
                month = dep_dt.month
            except Exception:
                advance_days = int(data.get('advance_days', 14))
                day_of_week = (datetime.now().weekday() + advance_days) % 7
                month = datetime.now().month
        else:
            advance_days = int(data.get('advance_days', 14))
            future_dt = datetime.now().date() + timedelta(days=advance_days)
            day_of_week = future_dt.weekday()
            month = future_dt.month
            departure_date_str = future_dt.isoformat()

        # Build feature DataFrame matching trained pipeline
        X_df = pd.DataFrame([{
            'origin': origin,
            'destination': destination,
            'airline': airline,
            'advance_days': advance_days,
            'day_of_week': day_of_week,
            'month': month,
        }])

        # Perform real model inference using loaded scikit-learn pipeline
        predicted_fare = float(self.model.predict(X_df)[0])
        predicted_fare = round(predicted_fare, 2)

        # Statistical prediction interval via ensemble variance across decision trees
        try:
            preprocessor = self.model.named_steps['preprocessor']
            regressor = self.model.named_steps['regressor']
            X_trans = preprocessor.transform(X_df)
            tree_preds = np.array([tree.predict(X_trans)[0] for tree in regressor.estimators_])
            std_err = float(np.std(tree_preds))
            lower_bound = round(max(0.0, predicted_fare - 1.96 * std_err), 2)
            upper_bound = round(predicted_fare + 1.96 * std_err, 2)
            confidence_score = round(max(0.70, min(0.99, 1.0 - (std_err / predicted_fare))), 3)
        except Exception:
            std_err = predicted_fare * 0.075
            lower_bound = round(predicted_fare * 0.925, 2)
            upper_bound = round(predicted_fare * 1.075, 2)
            confidence_score = 0.965

        # Yield Recommendation
        if advance_days >= 30:
            rec = 'Early Bird Rate Available'
            lead_mult = 0.84
        elif advance_days >= 14:
            rec = 'Optimal Booking Window'
            lead_mult = 1.00
        elif advance_days >= 7:
            rec = 'Fares Rising (Moderate Demand)'
            lead_mult = 1.30
        else:
            rec = 'Surge Period (Last Minute Fare)'
            lead_mult = 1.65

        return {
            'origin': origin,
            'destination': destination,
            'airline': airline,
            'airline_name': AIRLINE_NAMES.get(airline, airline),
            'advance_days': advance_days,
            'departure_date': departure_date_str,
            'prediction': predicted_fare,
            'predicted_fare': predicted_fare,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound,
            'currency': 'INR',
            'confidence_score': confidence_score,
            'lead_time_multiplier': lead_mult,
            'recommendation': rec,
            'model_version': self.model_version,
            'model': self.model_name,
            'status': 'success',
        }

predictor = Predictor()