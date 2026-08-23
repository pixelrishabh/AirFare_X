from fastapi import APIRouter, Depends
from app.api.deps import require_role
from app.scraper.jobs import run_ingestion_job

router = APIRouter()

@router.post("/run")
async def run_scraper(role: str = Depends(require_role)):
    result = run_ingestion_job()
    return {"status": "completed", "executed_by": role, **result}
