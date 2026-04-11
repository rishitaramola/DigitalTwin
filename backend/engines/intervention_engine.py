"""
Intervention Engine — decides when and how to intervene based on risk predictions.
"""
from datetime import datetime
from typing import Optional


INTERVENTION_SCRIPTS = {
    "soft_nudge": {
        "title": "Focus Check",
        "icon": "🧘",
        "action": "Take a breath",
        "timeout_seconds": 10
    },
    "intent_gate": {
        "title": "Intent Gate",
        "icon": "🎯",
        "action": "What's your goal for the next 20 minutes?",
        "timeout_seconds": 30
    },
    "hard_friction": {
        "title": "Pattern Detected",
        "icon": "⚠️",
        "action": "Your twin sees a distraction chain forming.",
        "timeout_seconds": None  # Requires user response
    }
}

CHAIN_PATTERNS = {
    "email_spiral": ["email", "news", "social_media"],
    "video_trap": ["news", "video", "video"],
    "anxiety_loop": ["social_media", "news", "social_media"],
    "late_night_scroll": ["messaging", "social_media", "video"],
    "work_avoidance": ["email", "social_media", "messaging"]
}


class InterventionEngine:
    def __init__(self):
        self.intervention_history = []
        self.chain_pattern_cache = {}

    def detect_chain_pattern(self, behaviour_chain: list) -> Optional[str]:
        """Identify if current chain matches a known distraction pattern."""
        if len(behaviour_chain) < 2:
            return None
        for pattern_name, pattern in CHAIN_PATTERNS.items():
            window = behaviour_chain[-len(pattern):]
            if window == pattern:
                return pattern_name
        return None

    def should_intervene(self, prediction: str, risk_score: float,
                          intervention_level: str, chain: list) -> bool:
        """Decide if we should actually trigger an intervention now."""
        if intervention_level == "none":
            return False

        # Don't over-intervene — check history
        if self.intervention_history:
            last = self.intervention_history[-1]
            seconds_since_last = (datetime.now() - last["timestamp"]).seconds
            if seconds_since_last < 300:  # 5 min cooldown
                return False

        return True

    def build_intervention(self, prediction: str, risk_score: float,
                            intervention_level: str, coach_message: str,
                            behaviour_chain: list) -> dict:
        """Build a full intervention payload."""
        chain_pattern = self.detect_chain_pattern(behaviour_chain)
        script = INTERVENTION_SCRIPTS.get(intervention_level, INTERVENTION_SCRIPTS["soft_nudge"])

        intervention = {
            "id": f"iv_{int(datetime.now().timestamp())}",
            "timestamp": datetime.now().isoformat(),
            "type": intervention_level,
            "title": script["title"],
            "icon": script["icon"],
            "primary_action": script["action"],
            "coach_message": coach_message,
            "risk_score": risk_score,
            "prediction": prediction,
            "chain_detected": behaviour_chain[-3:] if behaviour_chain else [],
            "chain_pattern": chain_pattern,
            "timeout_seconds": script["timeout_seconds"],
            "options": self._build_options(prediction, intervention_level)
        }

        self.intervention_history.append({
            "timestamp": datetime.now(),
            "type": intervention_level,
            "risk_score": risk_score
        })

        return intervention

    def _build_options(self, prediction: str, intervention_level: str) -> list:
        """Build response options for the user."""
        if prediction == "distraction":
            return [
                {"id": "focus", "label": "Stay focused 🎯", "value": "focus", "primary": True},
                {"id": "rest", "label": "I need rest 😴", "value": "intentional_rest", "primary": False},
                {"id": "allow", "label": "Allow this time 🔓", "value": "intentional_break", "primary": False}
            ]
        elif prediction == "burnout_risk":
            return [
                {"id": "rest_now", "label": "Rest now 🛌", "value": "rest", "primary": True},
                {"id": "walk", "label": "Take a walk 🚶", "value": "walk", "primary": False}
            ]
        else:
            return [
                {"id": "ok", "label": "Got it ✓", "value": "acknowledged", "primary": True}
            ]

    def compute_twin_divergence(self, events_today: list) -> dict:
        """Calculate how diverged the user is from their ideal twin."""
        if not events_today:
            return {"score": 12, "grade": "A", "trend": "improving"}

        distraction_events = sum(1 for e in events_today if e.get("label") == "distraction")
        burnout_events = sum(1 for e in events_today if e.get("label") == "burnout_risk")
        total = max(1, len(events_today))

        raw_divergence = ((distraction_events * 1.0 + burnout_events * 2.0) / total) * 100
        score = min(100, int(raw_divergence))

        if score < 20:
            grade = "A"
        elif score < 40:
            grade = "B"
        elif score < 60:
            grade = "C"
        else:
            grade = "D"

        return {
            "score": score,
            "grade": grade,
            "distraction_events": distraction_events,
            "deep_work_events": sum(1 for e in events_today if e.get("label") == "deep_work"),
            "total_events": total,
            "trend": "improving" if score < 35 else "declining"
        }


_intervention_engine = InterventionEngine()


def get_intervention_engine() -> InterventionEngine:
    return _intervention_engine
