import pandas as pd
from pathlib import Path
from typing import Dict, Tuple, List, Any
import logging

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "dashboard"

_cache: Dict[str, Tuple[float, pd.DataFrame]] = {}

def load_csv(filename: str) -> pd.DataFrame:
    path = DATA_DIR / filename
    if not path.exists():
        logger.warning(f"{filename} not found in {DATA_DIR}. Returning empty DataFrame.")
        return pd.DataFrame()

    try:
        mtime = path.stat().st_mtime
        cached = _cache.get(filename)
        if cached and cached[0] == mtime:
            return cached[1].copy()

        df = pd.read_csv(path)
        _cache[filename] = (mtime, df)
        return df.copy()
    except Exception as e:
        logger.error(f"Error loading {filename}: {e}")
        return pd.DataFrame()

def apply_filters(df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
    """Generic filter application — only filters on columns that exist and have a non-None value."""
    if df.empty:
        return df
        
    for col, val in filters.items():
        if val is not None and col in df.columns:
            try:
                if isinstance(val, int):
                    df = df[df[col].astype(int) == val]
                elif isinstance(val, str):
                    if val.lower() != "all" and val.strip() != "":
                        df = df[df[col].astype(str).str.upper() == str(val).strip().upper()]
                else:
                    df = df[df[col] == val]
            except Exception as e:
                logger.warning(f"Filter error on {col}={val}: {e}")
    return df

def to_json_safe(df: pd.DataFrame) -> List[Dict[str, Any]]:
    if df.empty:
        return []
    return df.where(pd.notnull(df), None).to_dict(orient="records")
