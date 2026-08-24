import os
import pandas as pd
import serpapi
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("SERPAPI_KEY")

client = serpapi.Client(api_key=api_key)

results = client.search({
    "engine": "google_flights",
    "gl": "in",
    "hl": "en",
    "departure_id": "DEL",
    "arrival_id": "BOM",
    "outbound_date": "2026-08-25",
    "currency": "INR",
    "type": "2",
    "travel_class": "1",
    "adults": "1"
})

rows = []

for flight in results.get("best_flights", []):

    price = flight.get("price")

    airline = "Unknown"

    if flight.get("flights"):
        airline = flight["flights"][0].get("airline", "Unknown")

    rows.append({
        "date": "2026-08-25",
        "origin": "DEL",
        "destination": "BOM",
        "airline": airline,
        "price": price
    })

df = pd.DataFrame(rows)

os.makedirs("data", exist_ok=True)

df.to_csv("data/fares.csv", index=False)

print(df)
print("\nData saved to data/fares.csv") 