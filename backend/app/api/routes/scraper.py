from fastapi import APIRouter, Depends
from app.api.deps import require_role, optional_authenticated
from app.scraper.jobs import run_ingestion_job, get_scraper_status

router = APIRouter()

@router.get("/status")
async def scraper_status(user=Depends(optional_authenticated)):
    return get_scraper_status()

@router.post("/run")
async def run_scraper(role: str = Depends(require_role)):
    result = run_ingestion_job()
    return {"status": "completed", "executed_by": role, **result}
