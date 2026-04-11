import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "digital_twin.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS behavioral_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            location TEXT,
            app_category TEXT,
            prev_app_category TEXT,
            dwell_time REAL,
            hour_of_day INTEGER,
            day_of_week INTEGER,
            stress_proxy REAL,
            typing_speed REAL,
            notification_response_time REAL,
            battery_level REAL,
            label TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            risk_score REAL,
            prediction TEXT,
            intervention_level TEXT,
            user_response TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interventions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            intervention_type TEXT,
            chain_detected TEXT,
            coach_message TEXT,
            user_response TEXT,
            success INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS flow_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT,
            end_time TEXT,
            duration_minutes REAL,
            location TEXT,
            trigger_context TEXT
        )
    """)

    conn.commit()
    conn.close()
    print("[DB] Database initialized successfully.")


if __name__ == "__main__":
    init_db()
