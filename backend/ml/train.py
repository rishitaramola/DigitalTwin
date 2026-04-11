"""
Training pipeline — generates synthetic data and trains the Decision Tree.
Run this once before starting the server.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ml.data_generator import generate_dataset
from ml.model import DigitalTwinModel
from database import init_db, get_connection
import pandas as pd


def seed_database(df: pd.DataFrame):
    """Seed the SQLite database with generated behavioral events."""
    conn = get_connection()
    records = df.to_dict("records")
    conn.executemany("""
        INSERT INTO behavioral_events
        (timestamp, location, app_category, prev_app_category, dwell_time,
         hour_of_day, day_of_week, stress_proxy, typing_speed,
         notification_response_time, battery_level, label)
        VALUES
        (:timestamp, :location, :app_category, :prev_app_category, :dwell_time,
         :hour_of_day, :day_of_week, :stress_proxy, :typing_speed,
         :notification_response_time, :battery_level, :label)
    """, records)
    conn.commit()
    conn.close()
    print(f"[Train] Seeded {len(records)} events into database.")


def run_training():
    print("=" * 60)
    print("  Digital Twin of You — Training Pipeline")
    print("  Team: Bit Rebels | Hack-o-Holic 4.0")
    print("=" * 60)

    # Initialize database
    init_db()

    # Generate synthetic training data
    print("\n[1/3] Generating behavioral data...")
    df = generate_dataset(days=14, events_per_day=80)

    # Seed database
    print("\n[2/3] Seeding database...")
    seed_database(df)

    # Train model
    print("\n[3/3] Training Decision Tree Classifier...")
    model = DigitalTwinModel()
    model.train(df)
    model.save()

    print("\n[✓] Training complete! Model saved.")
    print(f"    Label distribution:\n{df['label'].value_counts().to_string()}")
    print("\n    Top 5 feature importances:")
    for feat, imp in sorted(model.feature_importances.items(), key=lambda x: x[1], reverse=True)[:5]:
        bar = "█" * int(imp * 30)
        print(f"    {feat:<35} {bar} {imp:.3f}")
    print("\n[✓] Ready. Run: uvicorn main:app --reload")


if __name__ == "__main__":
    run_training()
