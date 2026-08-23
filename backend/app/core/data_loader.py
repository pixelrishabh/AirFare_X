import pandas as pd
from pathlib import Path
from typing import Dict, Tuple, List, Any

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "dashboard"

_cache: Dict[str, Tuple[float, pd.DataFrame]] = {}

def load_csv(filename: str) -> pd.DataFrame:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"{filename} not found in {DATA_DIR}")

    mtime = path.stat().st_mtime
    cached = _cache.get(filename)
    if cached and cached[0] == mtime:
        return cached[1]

    df = pd.read_csv(path)
    _cache[filename] = (mtime, df)
    return df

def apply_filters(df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
    """Generic filter application — only filters on columns that exist and have a non-None value."""
    for col, val in filters.items():
        if val is not None and col in df.columns:
            if isinstance(val, int):
                try:
                    df = df[df[col].astype(int) == val]
                except Exception:
                    df = df[df[col] == val]
            elif isinstance(val, str):
                df = df[df[col].astype(str).str.upper() == str(val).upper()]
            else:
                df = df[df[col] == val]
    return df

def to_json_safe(df: pd.DataFrame) -> List[Dict[str, Any]]:
    return df.where(pd.notnull(df), None).to_dict(orient="records")
