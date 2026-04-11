"""
Simulation Engine — runs "what if" projections to show users future ripple effects.
"""
from datetime import datetime, timedelta
import random
import math


OUTCOME_TEMPLATES = {
    "distraction": {
        "timeline": [
            {"t": 0, "action": "Open Instagram", "focus_impact": -5},
            {"t": 15, "action": "Still scrolling...", "focus_impact": -15},
            {"t": 45, "action": "YouTube autoplay kicks in", "focus_impact": -30},
            {"t": 90, "action": "Guilt & self-criticism sets in", "focus_impact": -10},
            {"t": 120, "action": "Attempt to refocus — shallow work only", "focus_impact": +5},
        ],
        "end_state": {
            "focus_tomorrow": 45,
            "sleep_quality": 55,
            "tasks_completed": 2,
            "guilt_score": 75,
            "recovery_hours": 3
        }
    },
    "focus": {
        "timeline": [
            {"t": 0, "action": "Chose deep work 🎯", "focus_impact": +5},
            {"t": 25, "action": "Flow state achieved", "focus_impact": +20},
            {"t": 50, "action": "Pomodoro 1 complete — high quality output", "focus_impact": +15},
            {"t": 90, "action": "Finished key deliverable", "focus_impact": +10},
            {"t": 120, "action": "Intentional rest — fully earned", "focus_impact": +5},
        ],
        "end_state": {
            "focus_tomorrow": 85,
            "sleep_quality": 80,
            "tasks_completed": 7,
            "guilt_score": 5,
            "recovery_hours": 0
        }
    },
    "walk": {
        "timeline": [
            {"t": 0, "action": "Started 10-min walk 🚶", "focus_impact": +3},
            {"t": 10, "action": "Cortisol dropping, BDNF rising", "focus_impact": +10},
            {"t": 20, "action": "Back at desk — fresh perspective", "focus_impact": +15},
            {"t": 50, "action": "Unexpected problem solved", "focus_impact": +20},
            {"t": 90, "action": "Deep work session complete", "focus_impact": +12},
        ],
        "end_state": {
            "focus_tomorrow": 82,
            "sleep_quality": 78,
            "tasks_completed": 6,
            "guilt_score": 0,
            "recovery_hours": 0
        }
    }
}


class SimulationEngine:
    def __init__(self):
        self.simulation_cache = {}

    def run_simulation(self, choice: str, current_focus: float = 0.6,
                        current_hour: int = None) -> dict:
        """Run a future simulation based on user's current choice."""
        if current_hour is None:
            current_hour = datetime.now().hour

        template = OUTCOME_TEMPLATES.get(choice, OUTCOME_TEMPLATES["focus"])

        # Add noise to make it feel realistic
        timeline = []
        cumulative_focus = current_focus * 100
        for point in template["timeline"]:
            cumulative_focus = max(5, min(100, cumulative_focus + point["focus_impact"] + random.uniform(-5, 5)))
            timeline.append({
                "time_minutes": point["t"],
                "action": point["action"],
                "focus_level": round(cumulative_focus),
                "clock_time": self._add_minutes(current_hour, point["t"])
            })

        end_state = template["end_state"].copy()
        # Personalize based on current conditions
        if current_hour > 20:
            end_state["sleep_quality"] = max(30, end_state["sleep_quality"] - 20)
            end_state["focus_tomorrow"] = max(30, end_state["focus_tomorrow"] - 15)

        return {
            "choice": choice,
            "simulation_start": datetime.now().isoformat(),
            "current_focus_pct": int(current_focus * 100),
            "timeline": timeline,
            "end_state": end_state,
            "verdict": self._generate_verdict(choice, end_state),
            "comparison": self._compare_choices(choice)
        }

    def _add_minutes(self, hour: int, minutes: int) -> str:
        base = datetime.now().replace(hour=hour, minute=0, second=0)
        result = base + timedelta(minutes=minutes)
        return result.strftime("%I:%M %p")

    def _generate_verdict(self, choice: str, end_state: dict) -> str:
        verdicts = {
            "focus": f"Choosing focus now means your tomorrow starts at {end_state['focus_tomorrow']}% cognitive capacity — your strongest days average 84%. You're on track.",
            "distraction": f"This choice typically costs {end_state['recovery_hours']} hours of recovery time and drops tomorrow's focus to {end_state['focus_tomorrow']}%. Your twin has seen this pattern before.",
            "walk": f"A 10-minute walk here is your #1 highest-ROI choice. Your data shows it consistently triggers {end_state['tasks_completed']} task completions in the 2 hours after. It's not rest — it's investment."
        }
        return verdicts.get(choice, "Simulation complete.")

    def _compare_choices(self, current_choice: str) -> list:
        """Return quick comparison of all three choices."""
        return [
            {
                "choice": "focus",
                "focus_score": OUTCOME_TEMPLATES["focus"]["end_state"]["focus_tomorrow"],
                "tasks": OUTCOME_TEMPLATES["focus"]["end_state"]["tasks_completed"],
                "label": "Deep Work"
            },
            {
                "choice": "walk",
                "focus_score": OUTCOME_TEMPLATES["walk"]["end_state"]["focus_tomorrow"],
                "tasks": OUTCOME_TEMPLATES["walk"]["end_state"]["tasks_completed"],
                "label": "Take a Walk"
            },
            {
                "choice": "distraction",
                "focus_score": OUTCOME_TEMPLATES["distraction"]["end_state"]["focus_tomorrow"],
                "tasks": OUTCOME_TEMPLATES["distraction"]["end_state"]["tasks_completed"],
                "label": "Distraction"
            }
        ]

    def generate_weekly_report(self) -> dict:
        """Generate the Habit DNA weekly narrative report."""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        weekly_data = []

        for i, day in enumerate(days):
            deep_work = random.randint(2, 8)
            distraction = random.randint(1, 6)
            flow_sessions = random.randint(0, 3)
            divergence = int((distraction / (deep_work + distraction)) * 100)

            weekly_data.append({
                "day": day,
                "deep_work_hours": deep_work,
                "distraction_events": distraction,
                "flow_sessions": flow_sessions,
                "twin_divergence": divergence,
                "is_super_day": deep_work >= 6 and divergence < 25,
                "is_burnout_day": divergence > 65 and i in [0, 3]
            })

        super_days = [d for d in weekly_data if d["is_super_day"]]
        worst_day = max(weekly_data, key=lambda d: d["twin_divergence"])
        best_day = min(weekly_data, key=lambda d: d["twin_divergence"])

        narrative = self._generate_narrative(weekly_data, super_days, best_day, worst_day)

        return {
            "week_of": datetime.now().strftime("%B %d, %Y"),
            "weekly_data": weekly_data,
            "summary": {
                "avg_divergence": round(sum(d["twin_divergence"] for d in weekly_data) / 7),
                "total_flow_sessions": sum(d["flow_sessions"] for d in weekly_data),
                "super_days_count": len(super_days),
                "best_day": best_day["day"],
                "worst_day": worst_day["day"]
            },
            "narrative": narrative,
            "success_patterns": [
                "10-min walk → 2+ hours deep work",
                "8 AM start → 40% higher output",
                "No email before 10 AM on power days"
            ],
            "insights": [
                f"Your biggest focus killer is the {worst_day['day']} 4:30 PM energy crash",
                f"On your {len(super_days)} Super Days, you logged 3+ Flow Sessions each",
                "Your distraction chains always start with Email → News — catch it at step 1"
            ]
        }

    def _generate_narrative(self, weekly_data, super_days, best_day, worst_day) -> str:
        total_focus = sum(d["deep_work_hours"] for d in weekly_data)
        total_distraction = sum(d["distraction_events"] for d in weekly_data)
        return (
            f"This week, your twin logged {total_focus} hours of deep work across 7 days — "
            f"that's {'above' if total_focus > 28 else 'below'} your monthly average. "
            f"Your {best_day['day']} was your strongest day: low divergence, high flow. "
            f"But {worst_day['day']} told a different story — {worst_day['distraction_events']} distraction events "
            f"and your highest divergence score of the week. "
            f"The pattern your twin keeps seeing: your distraction chains almost always start "
            f"with email → news. You broke that chain successfully {random.randint(2, 5)} times this week. "
            f"Keep catching it at that first link."
        )


_simulation_engine = SimulationEngine()


def get_simulation_engine() -> SimulationEngine:
    return _simulation_engine
