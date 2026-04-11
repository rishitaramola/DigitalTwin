"""
Digital Twin of You — FastAPI Backend
Team: Bit Rebels | Hack-o-Holic 4.0
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import random
import bcrypt
from jose import JWTError, jwt
from dotenv import load_dotenv
load_dotenv()
from email_service import send_otp_email

# In-memory OTP storage (email -> otp_string)
otp_store = {}

from database import init_db, get_connection
from ml.predictor import predict_from_context
from engines.observation_engine import get_observation_engine
from engines.intervention_engine import get_intervention_engine
from engines.simulation_engine import get_simulation_engine

# ─── Auth Config ──────────────────────────────────────────────────────────────
SECRET_KEY = "bit-rebels-digital-twin-secret-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer(auto_error=False)

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Digital Twin of You — API",
    description="Predictive Behavioural Mirror | Bit Rebels | Hack-o-Holic 4.0",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
init_db()

# Engine singletons
obs_engine = get_observation_engine()
intv_engine = get_intervention_engine()
sim_engine = get_simulation_engine()


# ─── Pydantic Models ──────────────────────────────────────────────────────────
class EventLog(BaseModel):
    app_category: str
    location: str = "desk"
    dwell_time: Optional[float] = None

class PredictRequest(BaseModel):
    hour_of_day: Optional[int] = None
    day_of_week: Optional[int] = None
    location: Optional[str] = "desk"
    app_category: Optional[str] = "idle"
    prev_app_category: Optional[str] = "idle"
    dwell_time: Optional[float] = 5.0
    stress_proxy: Optional[float] = None
    typing_speed: Optional[float] = None
    battery_level: Optional[float] = 70.0

class IntentResponse(BaseModel):
    intervention_id: str
    user_choice: str

class SimulateRequest(BaseModel):
    choice: str  # "focus" | "distraction" | "walk"
    current_focus: Optional[float] = 0.6

# ─── Auth Models ──────────────────────────────────────────────────────────────
class SendOTPRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    identifier: str
    password: str

class PasswordVerifyRequest(BaseModel):
    password: str

# ─── Auth Helpers ─────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    conn = get_connection()
    user = conn.execute(
        "SELECT id, username, email FROM users WHERE id = ?", (payload.get("sub"),)
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "project": "Digital Twin of You",
        "team": "Bit Rebels",
        "hackathon": "Hack-o-Holic 4.0",
        "status": "online",
        "version": "1.0.0"
    }


# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.post("/api/auth/send-otp")
def send_otp(req: SendOTPRequest):
    email = req.email.lower().strip()
    if not email:
        raise HTTPException(400, "Email is required")
        
    # Hackathon Demo Mode: Allow multiple OTP sends even if registered

    otp_code = str(random.randint(100000, 999999))
    otp_store[email] = otp_code
    
    success = send_otp_email(email, otp_code)
    if not success:
        raise HTTPException(500, "Failed to send Verification Email")
    return {"status": "sent", "message": "OTP sent successfully"}

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    email = req.email.lower().strip()
    if otp_store.get(email) == req.otp:
        otp_store[email] = "VERIFIED"
        return {"status": "verified"}
    raise HTTPException(400, "Invalid or expired OTP")

@app.post("/api/auth/signup")
def signup(req: SignupRequest):
    """Create a new user account."""
    email = req.email.lower().strip()
    if otp_store.get(email) != "VERIFIED":
        raise HTTPException(400, "Email must be verified first")

    if len(req.username.strip()) < 2:
        raise HTTPException(400, "Username must be at least 2 characters")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    conn = get_connection()
    # Hackathon Demo Mode: Overwrite if exists
    conn.execute(
        "DELETE FROM users WHERE email = ? OR username = ?",
        (req.email.lower().strip(), req.username.strip())
    )
    conn.commit()
    hashed = hash_password(req.password)
    cursor = conn.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        (req.username.strip(), req.email.lower().strip(), hashed)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    token = create_token({"sub": user_id, "username": req.username.strip()})
    return {"token": token, "user": {"id": user_id, "username": req.username.strip(), "email": req.email.lower().strip()}}


@app.post("/api/auth/login")
def login(req: LoginRequest):
    """Log in with email or username and password."""
    conn = get_connection()
    identifier = req.identifier.lower().strip()
    user = conn.execute(
        "SELECT id, username, email, password_hash, is_active FROM users WHERE email = ? OR username = ?",
        (identifier, identifier)
    ).fetchone()
    
    if not user or not verify_password(req.password, user["password_hash"]):
        conn.close()
        raise HTTPException(401, "Invalid username/email or password")
    
    # Auto-reactivate if deactivated
    if user["is_active"] == 0:
        conn.execute("UPDATE users SET is_active = 1 WHERE id = ?", (user["id"],))
        conn.commit()

    conn.close()
    token = create_token({"sub": user["id"], "username": user["username"]})
    return {"token": token, "user": {"id": user["id"], "username": user["username"], "email": user["email"]}}

@app.post("/api/auth/deactivate")
def deactivate_account(req: PasswordVerifyRequest, current_user: dict = Depends(get_current_user)):
    """Deactivate user account requiring password verification."""
    conn = get_connection()
    user = conn.execute("SELECT password_hash FROM users WHERE id = ?", (current_user["id"],)).fetchone()
    if not user or not verify_password(req.password, user["password_hash"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    conn.execute("UPDATE users SET is_active = 0 WHERE id = ?", (current_user["id"],))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Account deactivated"}

@app.post("/api/auth/delete")
def delete_account(req: PasswordVerifyRequest, current_user: dict = Depends(get_current_user)):
    """Permanently delete user account requiring password verification."""
    conn = get_connection()
    user = conn.execute("SELECT password_hash FROM users WHERE id = ?", (current_user["id"],)).fetchone()
    if not user or not verify_password(req.password, user["password_hash"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    conn.execute("DELETE FROM users WHERE id = ?", (current_user["id"],))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Account permanently deleted"}


@app.get("/api/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    """Get the currently logged-in user."""
    return current_user


@app.get("/api/current-state")
def get_current_state():
    """Get the current real-time behavioral state of the user."""
    features = obs_engine.get_current_features()
    prediction = predict_from_context(features)
    mood = obs_engine.get_mood_fingerprint()
    flow = obs_engine.detect_flow_state()

    # Get today's events for divergence
    conn = get_connection()
    today = datetime.now().date().isoformat()
    rows = conn.execute(
        "SELECT label FROM behavioral_events WHERE DATE(timestamp) = ?", (today,)
    ).fetchall()
    conn.close()

    today_events = [dict(r) for r in rows]
    divergence = intv_engine.compute_twin_divergence(today_events)

    intervention = None
    if intv_engine.should_intervene(
        prediction["prediction"],
        prediction["risk_score"],
        prediction["intervention_level"],
        features.get("behaviour_chain", [])
    ):
        intervention = intv_engine.build_intervention(
            prediction["prediction"],
            prediction["risk_score"],
            prediction["intervention_level"],
            prediction["coach_message"],
            features.get("behaviour_chain", [])
        )

    return {
        "timestamp": datetime.now().isoformat(),
        "prediction": prediction,
        "mood_fingerprint": mood,
        "flow_state_active": flow,
        "twin_divergence": divergence,
        "behaviour_chain": features.get("behaviour_chain", []),
        "active_intervention": intervention
    }


@app.post("/api/log-event")
def log_event(event: EventLog):
    """Log a new behavioral event from the client."""
    logged = obs_engine.log_event(event.app_category, event.location, event.dwell_time)

    conn = get_connection()
    conn.execute("""
        INSERT INTO behavioral_events
        (timestamp, location, app_category, prev_app_category, dwell_time,
         hour_of_day, day_of_week, stress_proxy, typing_speed,
         notification_response_time, battery_level, label)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        logged["timestamp"], event.location, event.app_category, "idle",
        event.dwell_time or 5.0, logged["hour_of_day"], logged["day_of_week"],
        0.4, 55.0, 8.0, 75.0, "unknown"
    ))
    conn.commit()
    conn.close()

    return {"status": "logged", "event": logged}


@app.post("/api/predict")
def predict(req: PredictRequest):
    """Run a prediction given explicit feature values."""
    context = req.dict()
    now = datetime.now()
    if context["hour_of_day"] is None:
        context["hour_of_day"] = now.hour
    if context["day_of_week"] is None:
        context["day_of_week"] = now.weekday()
    if context["stress_proxy"] is None:
        context["stress_proxy"] = obs_engine.get_mood_fingerprint()["stress_level"]
    if context["typing_speed"] is None:
        context["typing_speed"] = obs_engine.get_mood_fingerprint()["typing_speed_wpm"]

    context["behaviour_chain"] = obs_engine.get_behaviour_chain()
    return predict_from_context(context)


@app.get("/api/mood-fingerprint")
def mood_fingerprint():
    """Get the current mood fingerprint from passive signals."""
    return obs_engine.get_mood_fingerprint()


@app.get("/api/behaviour-chain")
def behaviour_chain():
    """Get the current detected behaviour chain."""
    chain = obs_engine.get_behaviour_chain()
    pattern = intv_engine.detect_chain_pattern(chain)
    return {
        "chain": chain,
        "chain_pattern": pattern,
        "risk_level": "high" if len(chain) >= 3 and pattern else "medium" if len(chain) >= 2 else "low"
    }


@app.get("/api/twin-divergence")
def twin_divergence():
    """Get today's Twin Divergence Score."""
    conn = get_connection()
    today = datetime.now().date().isoformat()
    rows = conn.execute(
        "SELECT label FROM behavioral_events WHERE DATE(timestamp) = ?", (today,)
    ).fetchall()
    conn.close()

    today_events = [dict(r) for r in rows]
    return intv_engine.compute_twin_divergence(today_events)


@app.post("/api/simulate")
def simulate(req: SimulateRequest):
    """Run a 'what if' simulation for the given choice."""
    if req.choice not in ["focus", "distraction", "walk", "rest"]:
        raise HTTPException(400, "Choice must be one of: focus, distraction, walk, rest")
    result = sim_engine.run_simulation(req.choice, req.current_focus)
    return result


@app.get("/api/habit-dna")
def habit_dna():
    """Get the weekly Habit DNA narrative report."""
    return sim_engine.generate_weekly_report()


@app.post("/api/intent-response")
def intent_response(response: IntentResponse):
    """Log the user's response to an intent gate intervention."""
    conn = get_connection()
    conn.execute("""
        INSERT INTO interventions (timestamp, intervention_type, chain_detected, user_response, success)
        VALUES (?, ?, ?, ?, ?)
    """, (
        datetime.now().isoformat(),
        "intent_gate",
        str(obs_engine.get_behaviour_chain()),
        response.user_choice,
        1 if response.user_choice in ["focus", "intentional_rest", "walk"] else 0
    ))
    conn.commit()
    conn.close()

    return {
        "status": "logged",
        "choice": response.user_choice,
        "twin_message": f"Logged. Your twin respects intentional choices — {'great call' if response.user_choice == 'focus' else 'rest is valid data too'}."
    }


@app.get("/api/shadow-self")
def shadow_self():
    """Get the Shadow Self comparison — focused twin vs distracted twin."""
    focused = sim_engine.run_simulation("focus", current_focus=0.65)
    distracted = sim_engine.run_simulation("distraction", current_focus=0.65)

    return {
        "focused_twin": focused,
        "distracted_twin": distracted,
        "divergence_in_2_hours": {
            "focus_gap": focused["end_state"]["focus_tomorrow"] - distracted["end_state"]["focus_tomorrow"],
            "task_gap": focused["end_state"]["tasks_completed"] - distracted["end_state"]["tasks_completed"],
            "sleep_quality_gap": focused["end_state"]["sleep_quality"] - distracted["end_state"]["sleep_quality"]
        }
    }


@app.get("/api/success-days")
def success_days():
    """Identify success patterns from historical data (Success Archaeology)."""
    conn = get_connection()
    rows = conn.execute("""
        SELECT day_of_week, hour_of_day, location, AVG(stress_proxy) as avg_stress, COUNT(*) as events
        FROM behavioral_events
        WHERE label = 'deep_work'
        GROUP BY day_of_week, location
        ORDER BY events DESC
        LIMIT 10
    """).fetchall()
    conn.close()

    patterns = [dict(r) for r in rows]

    return {
        "success_patterns": patterns,
        "super_day_conditions": [
            "7+ hours sleep the night before",
            "Start before 9 AM",
            "Desk location (not couch)",
            "No social media before 11 AM",
            "10-min walk between sessions"
        ],
        "your_superpower": "A 10-minute walk after lab sessions leads to 2+ hours of deep work 78% of the time."
    }


@app.get("/api/stats")
def get_stats():
    """Get overall usage statistics."""
    conn = get_connection()
    total = conn.execute("SELECT COUNT(*) as c FROM behavioral_events").fetchone()["c"]
    by_label = conn.execute(
        "SELECT label, COUNT(*) as c FROM behavioral_events GROUP BY label"
    ).fetchall()
    interventions_total = conn.execute("SELECT COUNT(*) as c FROM interventions").fetchone()["c"]
    conn.close()

    return {
        "total_events": total,
        "events_by_label": {row["label"]: row["c"] for row in by_label},
        "total_interventions": interventions_total,
        "model_status": "trained" if os.path.exists(os.path.join("ml", "model.pkl")) else "untrained"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
