"""
Predictor — wraps the trained model and provides smart prediction with coaching messages.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ml.model import DigitalTwinModel
from datetime import datetime
import random

_model_instance = None

COACH_MESSAGES = {
    "distraction": {
        "stress": [
            "I noticed a pattern — every time you get a stressful email, a scroll spiral follows. That's not weakness, it's a stress reflex. Try this: set a 10-minute timer, do the hardest thing on your list, then take 5 minutes of guilt-free rest.",
            "Your stress indicators are elevated. Before you open that app — take 3 slow breaths. Research shows 90 seconds is enough to break the cortisol spike. Your focused twin is waiting on the other side.",
            "High stress + that app sequence = your classic distraction trigger. Your twin suggests: close everything, write down the one thing stressing you, then decide. Named fears are smaller."
        ],
        "fatigue": [
            "Your focus tank is running low — and that's okay. Your data shows you're more productive after 25 minutes of real rest than pushing through. Your twin recommends: close the laptop, lie down, set a 25-min alarm. This is recovery science.",
            "Typing speed is down 30% from your morning baseline. Your brain is tired. Distraction feels like relief, but it's actually making the fatigue worse. Rest is the better choice.",
            "You've been in deep work for 3+ hours. Your twin says: the next 15 minutes of scrolling won't recharge you. A short walk will. What do you choose?"
        ],
        "trigger": [
            "Sequence detected: Email → News → Social Media. This is your #1 distraction chain. You're at the second link right now. Closing the chain here means the next 90 minutes are yours.",
            "Your twin is seeing the start of a pattern it knows well. The good news: catching it at this step means you can redirect with almost no willpower cost. Just close this tab.",
            "Pre-failure alert active. Your historical data shows that continuing this sequence costs you an average of 2.3 hours. Your twin believes you can break it right now."
        ]
    },
    "burnout_risk": [
        "Your burnout indicators are in the red zone. This isn't optional — your twin is recommending mandatory rest. No productivity is sustainable without recovery. Log off.",
        "Your pattern today matches your previous burnout days exactly. The only intervention that worked those times: stopping completely before 9 PM. It's not too late.",
        "Burnout risk detected. Your twin is pausing your focus goals for tonight. Rest is your only task right now. Everything else can wait."
    ],
    "rest_needed": [
        "Your system needs a recharge. Not social media — actual rest. Your twin suggests: step away from screens for 20 minutes. You'll return sharper.",
        "Late-night work sessions historically tank your next day's performance by 40%. Your twin is recommending sleep over productivity right now.",
        "You've been active for a long time. Your decision quality degrades after hour 8. Your twin says: the most productive thing you can do is rest."
    ],
    "deep_work": [
        "All signals are green. Your conditions match your top 10% of productive days. Your twin has cleared a 90-minute window. What's the one thing that would make today a win?",
        "Flow state conditions detected. I'm silencing non-critical notifications. This is your moment — deep work mode activated.",
        "Perfect conditions: right location, right time, right energy. Your twin sees a Super Day forming. Don't let it slip."
    ]
}


def get_coach_message(prediction: str, stress_proxy: float, hour: int, chain: list) -> str:
    """Return a contextual LLM-style coaching message."""
    if prediction == "distraction":
        if stress_proxy > 0.65:
            return random.choice(COACH_MESSAGES["distraction"]["stress"])
        elif hour > 15:
            return random.choice(COACH_MESSAGES["distraction"]["fatigue"])
        elif len(chain) >= 2:
            return random.choice(COACH_MESSAGES["distraction"]["trigger"])
        return random.choice(COACH_MESSAGES["distraction"]["trigger"])
    elif prediction == "burnout_risk":
        return random.choice(COACH_MESSAGES["burnout_risk"])
    elif prediction == "rest_needed":
        return random.choice(COACH_MESSAGES["rest_needed"])
    else:
        return random.choice(COACH_MESSAGES["deep_work"])


def get_intervention_level(risk_score: float, chain_length: int) -> str:
    """Determine intervention level based on risk score."""
    if risk_score >= 0.80 or chain_length >= 3:
        return "hard_friction"
    elif risk_score >= 0.60 or chain_length >= 2:
        return "intent_gate"
    elif risk_score >= 0.40:
        return "soft_nudge"
    else:
        return "none"


def get_predictor() -> DigitalTwinModel:
    global _model_instance
    if _model_instance is None:
        _model_instance = DigitalTwinModel()
        if _model_instance.is_trained():
            _model_instance.load()
        else:
            print("[Predictor] No model found. Run ml/train.py first.")
            _model_instance = None
    return _model_instance


def predict_from_context(context: dict) -> dict:
    """Full prediction pipeline with intervention level and coaching message."""
    predictor = get_predictor()
    now = datetime.now()

    features = {
        "hour_of_day": context.get("hour_of_day", now.hour),
        "day_of_week": context.get("day_of_week", now.weekday()),
        "location": context.get("location", "desk"),
        "app_category": context.get("app_category", "idle"),
        "prev_app_category": context.get("prev_app_category", "idle"),
        "dwell_time": context.get("dwell_time", 5.0),
        "stress_proxy": context.get("stress_proxy", 0.4),
        "typing_speed": context.get("typing_speed", 55.0),
        "notification_response_time": context.get("notification_response_time", 10.0),
        "battery_level": context.get("battery_level", 70.0),
    }

    if predictor is None:
        # Demo fallback
        import random
        risk = round(random.uniform(0.4, 0.9), 3)
        prediction = "distraction" if risk > 0.6 else "deep_work"
        result = {
            "prediction": prediction,
            "risk_score": risk,
            "confidence": round(random.uniform(0.65, 0.95), 3),
            "probabilities": {"deep_work": 0.2, "distraction": risk, "rest_needed": 0.1, "burnout_risk": 0.1},
            "top_features": [("hour_of_day", 0.35), ("stress_proxy", 0.28), ("app_category_enc", 0.20)]
        }
    else:
        result = predictor.predict(features)

    chain = context.get("behaviour_chain", [])
    intervention = get_intervention_level(result["risk_score"], len(chain))
    coach = get_coach_message(
        result["prediction"],
        features["stress_proxy"],
        features["hour_of_day"],
        chain
    )

    return {
        **result,
        "intervention_level": intervention,
        "coach_message": coach,
        "behaviour_chain": chain,
        "features_used": features
    }
