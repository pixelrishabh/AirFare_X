from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import scraper, index, ml

app = FastAPI(title="AirFareX Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scraper.router, prefix="/api/scraper", tags=["scraper"])
app.include_router(index.router, prefix="/api/index", tags=["index"])
app.include_router(ml.router, prefix="/api/ml", tags=["ml"])

@app.get("/health")
def health():
    return {"status": "ok"}
