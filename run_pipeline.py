import subprocess
import sys


# ==========================================
# PIPELINE STEPS
# ==========================================

steps = [
    ("Clean live fare data", "src/cleaner.py"),
    ("Feature engineering", "src/feature_engineering.py"),
    ("Calculate airfare index", "src/index_calculator.py"),
    
    ("Historical data cleaning", "src/historical_cleaner.py"),
    ("Historical analysis", "src/historical_analysis.py"),
    ("Historical price trend", "src/historical_trend.py"),
    ("Historical airfare index", "src/historical_index.py"),
    
    ("Forecasting", "src/forecaster.py"),
    ("Prepare dashboard data", "src/prepare_dashboard_data.py"),
]


# ==========================================
# RUN
# ==========================================

print("=" * 60)
print("AIRFARE INDEX PIPELINE")
print("=" * 60)


for name, script in steps:

    print("\n" + "-" * 60)
    print(f"RUNNING: {name}")
    print("-" * 60)

    result = subprocess.run(
        [sys.executable, script]
    )

    if result.returncode != 0:

        print(
            f"\nPIPELINE FAILED: {script}"
        )

        sys.exit(1)

    print(
        f"COMPLETED: {name}"
    )


# ==========================================
# COMPLETE
# ==========================================

print("\n" + "=" * 60)
print("AIRFARE PIPELINE COMPLETED")
print("=" * 60)

print("\nDashboard data:")
print("data/dashboard/")