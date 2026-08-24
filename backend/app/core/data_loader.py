import math
import logging
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, date
from typing import Dict, Tuple, List, Any, Optional

logger = logging.getLogger("AirFareX.DataLoader")

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "dashboard"

_cache: Dict[str, Tuple[float, pd.DataFrame]] = {}

def clear_cache():
    """Invalidates all in-memory cached DataFrames to ensure fresh disk reads."""
    global _cache
    _cache.clear()
    logger.info("Cleared in-memory dashboard CSV cache.")

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
    """Generic filter application - filters on columns that exist and have non-None values."""
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

def clean_val(val: Any) -> Any:
    """Converts NaN, NaT, Inf, and non-JSON-compliant values to None / clean primitives."""
    if val is None or pd.isna(val):
        return None
    if isinstance(val, (float, np.floating)):
        if math.isnan(val) or math.isinf(val) or np.isnan(val) or np.isinf(val):
            return None
        return float(val)
    if isinstance(val, (int, np.integer)):
        return int(val)
    if isinstance(val, (pd.Timestamp, datetime, date)):
        return val.isoformat()
    return val

def to_json_safe(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Converts a DataFrame to a clean, JSON-serializable list of dictionaries with no NaN/Inf leaks."""
    if df.empty:
        return []
    records = df.to_dict(orient="records")
    return [{k: clean_val(v) for k, v in row.items()} for row in records]