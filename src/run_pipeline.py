import subprocess
import sys


STEPS = [
    ("Cleaning data", "src/cleaner.py"),
    ("Feature engineering", "src/feature_engineering.py"),
    ("Anomaly detection", "src/anomaly_detector.py"),
    ("Airfare index", "src/index_calculator.py"),
    ("Dashboard preparation", "src/prepare_dashboard_data.py"),
]


def run_step(name, script):

    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    result = subprocess.run(
        [sys.executable, script]
    )

    if result.returncode != 0:

        print(
            f"\nERROR: {name} failed."
        )

        sys.exit(
            result.returncode
        )


def main():

    print("=" * 60)
    print("AIRFARE INDEX DATA PIPELINE")
    print("=" * 60)

    for name, script in STEPS:

        run_step(
            name,
            script
        )

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)

    print(
        "\nDashboard data is available in:"
    )

    print(
        "data/dashboard/"
    )


if __name__ == "__main__":
    main()