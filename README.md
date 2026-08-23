# AirFareX — Real-Time Indian Airfare Price Index & Intelligence Platform

> **AirFareX** is a high-precision, real-time airfare analytics and price indexing system designed specifically for the Indian domestic aviation market. It tracks pricing volatility across major corridors (DEL, BOM, BLR, HYD, CCU, MAA) and carriers (IndiGo, Air India, Air India Express, Akasa Air, SpiceJet), generating a standardized airfare index (**APIx**) anchored to a January 2026 baseline.

---

## 🏗️ Repository Architecture

The project is cleanly modularized into frontend dashboard, FastAPI backend microservice, and Supabase database definitions:

```
AirFareX/
├── frontend/                  # React 18 + Vite + TypeScript + shadcn/ui Frontend Application
│   ├── src/
│   │   ├── components/        # Shared UI & AirfarexHeader components
│   │   ├── features/          # Feature modules (overview, airfare-index, route-analysis, backtesting, etc.)
│   │   ├── lib/               # Supabase SDK client, backend API client, require-role guards
│   │   ├── routes/            # TanStack Router file-based route definitions
│   │   ├── services/          # Real Supabase table API service layer
│   │   └── stores/            # Zustand session & role auth store
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                   # FastAPI + Python 3.11+ Microservice Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py        # Supabase JWT authentication & role-checker dependency
│   │   │   └── routes/        # API route handlers (scraper, index, ml)
│   │   ├── core/              # Supabase Admin Service-Role client & settings
│   │   ├── index_calc/        # Base-period weighted index calculation engine
│   │   ├── scraper/           # Scraper ingestion job & pipeline scheduler
│   │   └── ml/                # ML model slot & predictor interface
│   ├── requirements.txt
│   ├── requirements-ml.txt
│   └── .env.example
│
└── supabase/                  # Database DDL & RLS Policies
    └── step7_schema.sql       # Reference tables, fare quotes, RLS policies, & aggregate view
```

---

## ✨ Key Features & Capability Matrix

- 📈 **APIx Price Index**: Computes real weighted airfare index series ($100.0$ baseline) against domestic fare quotes.
- 🛫 **Corridor & Airline Analytics**: Interactive heatmaps and pricing matrix across 25+ top Indian flight routes and 5 major carriers.
- 🔐 **Role-Based Access Control (RBAC)**: Supabase Authentication supporting `ADMIN`, `ANALYST`, and `VIEWER` roles.
  - `/backtesting` route gated to `ADMIN` and `ANALYST` roles.
  - Data Explorer CSV Export button gated to authorized roles.
  - Security-definer aggregate views (`route_fare_summary`) for `VIEWER` access.
- ⚡ **FastAPI Backend Pipeline**:
  - `POST /api/scraper/run`: Trigger synthetic fare quote ingestion.
  - `POST /api/index/compute`: Compute moving weighted APIx index relative to base snapshot.
  - `POST /api/ml/predict`: Isolated interface ready for trained ML prediction models (`.pkl` / `.onnx`).

---

## 🚀 Quick Start Guide

### 1. Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Copy and run the contents of [`supabase/step7_schema.sql`](file:///c:/Users/Rishabh/OneDrive/Desktop/sih26/supabase/step7_schema.sql).

---

### 2. Backend Setup (FastAPI Microservice)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env and supply your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# 5. Start the FastAPI development server
python -m uvicorn app.main:app --reload --port 8000
```
Backend Health Check: Open [http://localhost:8000/health](http://localhost:8000/health) → returns `{"status": "ok"}`.

---

### 3. Frontend Setup (React + Vite)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY match your Supabase project

# 4. Start the Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤖 Teammate ML Model Integration Guide

To plug a trained machine learning fare prediction model into AirFareX:

1. Drop your trained model file (`fare_predictor.pkl`, `.onnx`, or `.pt`) into `backend/app/ml/models/`.
2. Add any ML framework dependencies (e.g. `scikit-learn`, `joblib`, `torch`) to `backend/requirements-ml.txt`.
3. Load the model inside `Predictor._load_if_available()` in `backend/app/ml/predictor.py`.
4. Implement `Predictor.predict()` logic. **No frontend or route changes required!**

---

## 📜 License & Acknowledgments

Built for the **Smart India Hackathon (SIH 2026)**. Powered by React, Vite, shadcn/ui, FastAPI, and Supabase.
