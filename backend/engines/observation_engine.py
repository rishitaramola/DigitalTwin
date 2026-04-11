"""
Observation Engine — processes raw behavioral signals into feature vectors.
"""
from datetime import datetime, timedelta
import random


class ObservationEngine:
    """
    Converts raw device/app events into structured feature vectors
    for the prediction engine. In production this would process real
    app usage logs; for the demo it simulates realistic live data.
    """

    def __init__(self):
        self.event_buffer = []
        self.chain_window = []  # Last 5 app events
        self.session_start = datetime.now()

    def log_event(self, app_category: str, location: str, dwell_time: float = None):
        """Log a new behavioral event."""
        now = datetime.now()
        event = {
            "timestamp": now.isoformat(),
            "app_category": app_category,
            "location": location,
            "hour_of_day": now.hour,
            "day_of_week": now.weekday(),
            "dwell_time": dwell_time or random.uniform(2, 20)
        }
        self.event_buffer.append(event)
        self.chain_window.append(app_category)
        if len(self.chain_window) > 6:
            self.chain_window.pop(0)
        return event

    def get_current_features(self) -> dict:
        """Extract features from current session state."""
        now = datetime.now()
        hour = now.hour

        # Simulate mood fingerprint signals
        stress_proxy = self._compute_stress(hour)
        typing_speed = max(15, 65 - (stress_proxy * 25) + random.uniform(-5, 5))

        # App categories for context
        last_events = self.event_buffer[-5:] if self.event_buffer else []
        app_category = last_events[-1]["app_category"] if last_events else "idle"
        prev_app_category = last_events[-2]["app_category"] if len(last_events) > 1 else "idle"
        location = last_events[-1].get("location", "desk") if last_events else "desk"

        return {
            "hour_of_day": hour,
            "day_of_week": now.weekday(),
            "location": location,
            "app_category": app_category,
            "prev_app_category": prev_app_category,
            "dwell_time": round(random.uniform(3, 15), 2),
            "stress_proxy": round(stress_proxy, 3),
            "typing_speed": round(typing_speed, 2),
            "notification_response_time": round(random.exponential(8) if stress_proxy < 0.6 else random.exponential(20), 2),
            "battery_level": round(max(10, 80 - len(self.event_buffer) * 0.5 + random.uniform(-5, 5)), 1),
            "behaviour_chain": list(self.chain_window)
        }

    def _compute_stress(self, hour: int) -> float:
        """Simulate stress level based on time and event patterns."""
        base = 0.3
        # Afternoon energy crash
        if 14 <= hour <= 17:
            base += 0.2
        # Late night
        if hour >= 22 or hour <= 6:
            base += 0.25
        # Morning rush
        if 8 <= hour <= 10:
            base += 0.1
        # Chain detection boost
        chain = self.chain_window[-3:]
        if "email" in chain and "news" in chain:
            base += 0.2
        if "social_media" in chain:
            base += 0.1
        return min(1.0, base + random.uniform(-0.05, 0.1))

    def get_mood_fingerprint(self) -> dict:
        """Generate mood fingerprint from passive signals."""
        now = datetime.now()
        hour = now.hour
        stress = self._compute_stress(hour)

        # Infer mood dimensions from passive signals
        app_switching_rate = len(self.chain_window) / max(1, (datetime.now() - self.session_start).seconds / 60)

        emotional_state = "neutral"
        if stress > 0.75:
            emotional_state = "stressed"
        elif stress > 0.55:
            emotional_state = "distracted"
        elif stress < 0.35:
            emotional_state = "focused"
        elif hour > 21:
            emotional_state = "fatigued"

        return {
            "stress_level": round(stress, 2),
            "focus_score": round(max(0, 1 - stress), 2),
            "energy_level": round(max(0.1, 1 - max(0, (hour - 14) * 0.08)), 2),
            "anxiety_index": round(min(1, app_switching_rate * 0.3 + stress * 0.5), 2),
            "emotional_state": emotional_state,
            "typing_speed_wpm": round(max(15, 65 - stress * 30), 1),
            "notification_lag_seconds": round(5 + stress * 25, 1),
            "app_switch_rate": round(app_switching_rate, 2)
        }

    def detect_flow_state(self) -> bool:
        """Detect if user is in a flow state (sustained deep work)."""
        if len(self.event_buffer) < 3:
            return False
        last_3 = self.event_buffer[-3:]
        return all(e["app_category"] == "deep_work" for e in last_3)

    def get_behaviour_chain(self) -> list:
        return list(self.chain_window)


import numpy as np
# Patch for numpy compatibility in observation engine
random.exponential = np.random.exponential


# Singleton instance
_observation_engine = ObservationEngine()


def get_observation_engine() -> ObservationEngine:
    return _observation_engine
