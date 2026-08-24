from fastapi import APIRouter, Depends
from typing import Optional
from app.api.deps import require_admin, optional_authenticated, AuthenticatedUser
from app.scraper.jobs import run_ingestion_job, get_scraper_status

router = APIRouter()

@router.get("/status")
async def scraper_status(user: Optional[AuthenticatedUser] = Depends(optional_authenticated)):
    return get_scraper_status()

@router.post("/run")
async def run_scraper(user: AuthenticatedUser = Depends(require_admin)):
    result = run_ingestion_job()
    return {"status": "completed", "executed_by": user.email, "role": user.role, **result}