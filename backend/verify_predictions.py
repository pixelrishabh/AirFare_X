import sys
sys.path.insert(0, 'backend')
from app.ml.predictor import predictor

test_cases = [
    {'origin': 'DEL', 'destination': 'BOM', 'airline': '6E', 'advance_days': 2, 'departure_date': '2026-08-26', 'desc': 'DEL -> BOM (IndiGo, Last-Minute 2 days)'},
    {'origin': 'DEL', 'destination': 'BOM', 'airline': '6E', 'advance_days': 35, 'departure_date': '2026-09-28', 'desc': 'DEL -> BOM (IndiGo, Early Bird 35 days)'},
    {'origin': 'DEL', 'destination': 'BLR', 'airline': 'AI', 'advance_days': 15, 'departure_date': '2026-09-08', 'desc': 'DEL -> BLR (Air India, 15 days window)'},
    {'origin': 'BOM', 'destination': 'DEL', 'airline': 'QP', 'advance_days': 7, 'departure_date': '2026-08-31', 'desc': 'BOM -> DEL (Akasa Air, 7 days window)'},
    {'origin': 'BLR', 'destination': 'HYD', 'airline': '6E', 'advance_days': 20, 'departure_date': '2026-09-13', 'desc': 'BLR -> HYD (IndiGo, Short-haul 20 days)'},
]

print("=" * 80)
print("          LIVE ML MODEL INFERENCE TEST (scikit-learn RandomForest)")
print("=" * 80)

for tc in test_cases:
    res = predictor.predict(tc)
    desc = tc['desc']
    origin = res['origin']
    dest = res['destination']
    airline_name = res['airline_name']
    airline = res['airline']
    advance = res['advance_days']
    fare = res['predicted_fare']
    lb = res['lower_bound']
    ub = res['upper_bound']
    conf = res['confidence_score']
    rec = res['recommendation']
    
    print(f"Scenario: {desc}")
    print(f"  Input:  {origin} -> {dest} | Airline: {airline_name} ({airline}) | Lead: {advance}d")
    print(f"  Output: Predicted Fare = INR {fare:.2f}")
    print(f"          Interval: [INR {lb:.2f} - INR {ub:.2f}]")
    print(f"          Confidence: {conf} | Recommendation: {rec}")
    print("-" * 80)