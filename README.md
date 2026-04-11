# Digital Twin of You 🧠
### Team: **Bit Rebels** | Rishita Ramola | Graphic Era Deemed to be University
### Hackathon: **Hack-o-Holic 4.0**

---

> *"Every other app shows you the crime scene after the fact.*
> *Digital Twin of You is the predictive detective — arriving before the crime."*

---

## What is this?

**Digital Twin of You** is not a habit tracker. It is a **real-time predictive simulation engine** that creates a living digital mirror of your behavioral patterns. It learns the hidden chains in your daily life and predicts (and prevents) your next failure *before it happens*.

---

## Features Implemented

| Module | Description |
|---|---|
| 🧠 **Live Twin Dashboard** | Real-time prediction, mood fingerprint, behaviour chain, divergence gauge |
| 🎯 **Intent Gate** | AI coach intervention that fires when distraction risk is high |
| 🔮 **Run the Future** | "What if" simulation — see the 2-hour ripple effect of any choice |
| 👤 **Shadow Self Mode** | Two futures side-by-side: focused twin vs distracted twin |
| 🧬 **Habit DNA Report** | AI-generated weekly narrative + success/failure pattern mining |
| ⚡ **Success Archaeology** | Mines your best days to find and replicate success conditions |
| 🔒 **100% On-Device** | All ML inference runs locally — zero data leaves your machine |

---

## Project Structure

```
Bit Rebels/
├── backend/
│   ├── main.py               ← FastAPI server (12 API endpoints)
│   ├── database.py           ← SQLite setup (local, private)
│   ├── requirements.txt
│   ├── ml/
│   │   ├── data_generator.py ← 14-day synthetic behavioral dataset
│   │   ├── model.py          ← Decision Tree Classifier (Scikit-learn)
│   │   ├── train.py          ← Training pipeline
│   │   └── predictor.py      ← Prediction + AI coaching messages
│   └── engines/
│       ├── observation_engine.py   ← Feature extraction, mood fingerprint
│       ├── intervention_engine.py  ← Chain detection, intervention levels
│       └── simulation_engine.py   ← Future simulation, weekly reports
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           ← Router (5 pages)
│   │   ├── index.css         ← Full design system (dark mode)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       ← Live twin view
│   │   │   ├── Simulation.jsx      ← Run the future
│   │   │   ├── ShadowSelf.jsx      ← Two timelines
│   │   │   ├── HabitDNA.jsx        ← Weekly narrative report
│   │   │   └── SuccessArchaeology.jsx
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── TwinDivergenceGauge.jsx
│   │       ├── BehaviourChain.jsx
│   │       ├── IntentGate.jsx
│   │       └── MoodFingerprint.jsx
│   ├── package.json
│   └── index.html
│
├── setup.bat  ← Run once to install everything
└── start.bat  ← Run to launch the app
```

---

## Quick Start (Mac/Linux)

### Step 1 — Prerequisites
- [Python 3.9+](https://python.org/downloads)
- [Node.js 18+](https://nodejs.org)

### Step 2 — First Time Setup (Terminal)
Run these commands in your terminal from the project root:
```bash
# 1. Install backend dependencies
cd backend
pip install -r requirements.txt

# 2. Train the ML model
python ml/train.py
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3 — Run the App
You will need two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Opens the frontend at **http://localhost:3000** and the API at **http://localhost:8000**

> **Note:** The app works in **Demo Mode** even without the backend running — all pages show realistic mock data.

---

## Quick Start (Windows)

### Step 1 — Prerequisites
- [Python 3.9+](https://python.org/downloads)
- [Node.js 18+](https://nodejs.org)

### Step 2 — First Time Setup
```batch
setup.bat
```
This will:
1. Install all Python packages
2. Generate synthetic training data (14 days × 80 events/day)
3. Train the Decision Tree model
4. Install frontend Node packages

### Step 3 — Run the App
```batch
start.bat
```
Opens the frontend at **http://localhost:3000** and the API at **http://localhost:8000**

> **Note:** The app works in **Demo Mode** even without the backend running — all pages show realistic mock data.

---

## Tech Stack

### Machine Learning
- **Scikit-learn** — Decision Tree Classifier
- **Pandas + NumPy** — Feature engineering
- **Joblib** — Model serialization

### Backend
- **FastAPI** — Async REST API
- **SQLite** — Local database (zero cloud)
- **Uvicorn** — ASGI server

### Frontend
- **React 18 + Vite** — Fast, modern UI
- **Recharts** — Beautiful data visualizations
- **Framer Motion** — Smooth animations
- **Lucide React** — Icon system

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/current-state` | GET | Full real-time behavioral state |
| `/api/predict` | POST | Run a prediction from features |
| `/api/log-event` | POST | Log a new app/behavior event |
| `/api/mood-fingerprint` | GET | Passive emotional state signals |
| `/api/behaviour-chain` | GET | Current chain + pattern detection |
| `/api/twin-divergence` | GET | Today's divergence score |
| `/api/simulate` | POST | Run a "what if" simulation |
| `/api/habit-dna` | GET | Weekly narrative report |
| `/api/shadow-self` | GET | Focused vs distracted twin comparison |
| `/api/success-days` | GET | Success archaeology results |
| `/api/intent-response` | POST | Log user response to intervention |

Interactive docs: **http://localhost:8000/docs**

---

## The Core Innovation

Most apps ask: *"Why did you fail yesterday?"*

We ask: *"You're about to fail in 15 minutes — do you still want to?"*

The system works by:
1. **Observing** passive behavioral signals (no manual logging)
2. **Detecting** known distraction chains (Email → News → Social Media)
3. **Predicting** the outcome with a trained Decision Tree
4. **Intervening** with the right friction at the right moment
5. **Simulating** the ripple effect so users make informed choices

---

## Privacy Architecture

> All ML training, inference, and data storage happens **locally on your device**.
> The only data that ever leaves is a single Twin Divergence Score number — and only if you opt into the Accountability Mirror feature.

- ✅ No cloud account required
- ✅ SQLite database — local file only
- ✅ Models saved as local `.pkl` files
- ✅ Open source — full code transparency

---

*Built with ❤️ for Hack-o-Holic 4.0 | Team Bit Rebels | Graphic Era Deemed to be University*
