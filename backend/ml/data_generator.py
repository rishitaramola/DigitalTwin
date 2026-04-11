import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

# Categories
APP_CATEGORIES = ["deep_work", "email", "news", "social_media", "video", "messaging", "utility", "idle"]
LOCATIONS = ["desk", "couch", "cafe", "commute", "bed"]

LABEL_MAP = {
    "deep_work": 0,
    "distraction": 1,
    "rest_needed": 2,
    "burnout_risk": 3
}

random.seed(42)
np.random.seed(42)


def simulate_stress(hour, day_of_week, app_seq):
    """Simulate stress level based on context."""
    base = 0.3
    if hour in [9, 10, 14, 15, 16]:
        base += 0.2
    if day_of_week in [0, 4]:  # Monday/Friday stress
        base += 0.15
    if "email" in app_seq:
        base += 0.2
    if "social_media" in app_seq:
        base -= 0.1  # temporary relief
    return min(1.0, max(0.0, base + np.random.normal(0, 0.05)))


def simulate_typing_speed(stress, hour):
    """Slower typing = fatigue or distraction."""
    base = 60  # WPM
    fatigue_factor = max(0, (hour - 14) * 2) if hour > 14 else 0
    speed = base - (stress * 20) - fatigue_factor + np.random.normal(0, 5)
    return max(10.0, speed)


def determine_label(hour, stress, app_category, prev_app, location, day):
    """Rule-based label generation for training data."""
    # Burnout risk conditions
    if stress > 0.8 and hour > 20:
        return "burnout_risk"
    if stress > 0.75 and day in [0, 4] and hour > 18:
        return "burnout_risk"

    # Rest needed
    if hour > 22 or (stress > 0.65 and hour > 18):
        return "rest_needed"
    if hour < 7:
        return "rest_needed"

    # Distraction chain detection
    distraction_chain = ["email", "news", "social_media"]
    video_chain = ["news", "video"]
    if prev_app in ["email", "news"] and app_category in ["social_media", "video", "news"]:
        return "distraction"
    if app_category == "social_media" and hour in range(9, 18):
        return "distraction"
    if app_category == "video" and hour in range(9, 17) and stress > 0.4:
        return "distraction"

    # Deep work conditions
    if app_category == "deep_work" and location == "desk" and hour in range(8, 13):
        return "deep_work"
    if app_category == "deep_work" and stress < 0.4:
        return "deep_work"

    return "distraction" if stress > 0.5 else "deep_work"


def generate_dataset(days=14, events_per_day=80):
    """Generate realistic synthetic behavioral data."""
    records = []
    start_date = datetime.now() - timedelta(days=days)

    for day in range(days):
        current_date = start_date + timedelta(days=day)
        day_of_week = current_date.weekday()
        prev_app = "idle"

        # Generate events throughout the day
        hours = sorted(random.choices(range(7, 23), k=events_per_day))

        for i, hour in enumerate(hours):
            minute = random.randint(0, 59)
            timestamp = current_date.replace(hour=hour, minute=minute)

            # Location logic
            if hour < 9:
                location = "bed"
            elif hour < 18:
                location = random.choices(["desk", "cafe", "commute"], weights=[0.6, 0.2, 0.2])[0]
            else:
                location = random.choices(["couch", "desk", "bed"], weights=[0.5, 0.3, 0.2])[0]

            # App category with temporal patterns
            if hour in range(9, 17) and location == "desk":
                app_category = random.choices(
                    APP_CATEGORIES,
                    weights=[0.35, 0.2, 0.1, 0.1, 0.08, 0.07, 0.05, 0.05]
                )[0]
            elif hour > 20:
                app_category = random.choices(
                    APP_CATEGORIES,
                    weights=[0.05, 0.05, 0.15, 0.25, 0.3, 0.1, 0.05, 0.05]
                )[0]
            else:
                app_category = random.choices(
                    APP_CATEGORIES,
                    weights=[0.15, 0.15, 0.15, 0.2, 0.15, 0.1, 0.05, 0.05]
                )[0]

            app_seq = [prev_app, app_category]
            stress = simulate_stress(hour, day_of_week, app_seq)
            typing_speed = simulate_typing_speed(stress, hour)
            dwell_time = np.random.exponential(8)  # avg 8 min dwell
            notification_response = np.random.exponential(5) if stress < 0.6 else np.random.exponential(15)
            battery = max(5, 100 - (i * 1.2) + random.uniform(-5, 5))

            label = determine_label(hour, stress, app_category, prev_app, location, day_of_week)

            records.append({
                "timestamp": timestamp.isoformat(),
                "location": location,
                "app_category": app_category,
                "prev_app_category": prev_app,
                "dwell_time": round(dwell_time, 2),
                "hour_of_day": hour,
                "day_of_week": day_of_week,
                "stress_proxy": round(stress, 3),
                "typing_speed": round(typing_speed, 2),
                "notification_response_time": round(notification_response, 2),
                "battery_level": round(battery, 1),
                "label": label
            })

            prev_app = app_category

    df = pd.DataFrame(records)
    print(f"[DataGen] Generated {len(df)} behavioral events over {days} days.")
    return df


if __name__ == "__main__":
    df = generate_dataset()
    df.to_csv("behavioral_data.csv", index=False)
    print(df["label"].value_counts())
