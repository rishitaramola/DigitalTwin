# Digital Twin of You: Evaluator Guide & Interactive Functionality Module

Welcome to the Digital Twin of You — a Predictive Behavioral Mirror that intelligently simulates your persona to encourage focus and prevent digital burnout. This guide is specifically designed for the evaluator to understand each module, its underlying logic, and the user workflow.

---

## 🏗 System Architecture Overview

The system comprises a **React-based frontend** heavily utilizing glass-morphism and real-time aesthetic updates, paired with a **FastAPI Python backend**. The backend is powered by localized Scikit-Learn models and three internal analytical engines that analyze behavior in real-time.

---

## 🔍 Core Engines & Modules

### 1. Observation Engine (The "Eyes")
- **What it does:** Passively ingests raw behavioral signals (e.g., app category, location, typing speed, stress proxies).
- **Evaluation Point:** Demonstrate how the system seamlessly converts continuous streams into structured "Mood Fingerprints." Show the evaluator the dynamic updates of the stress level and focus score. Note that the system requires no manual input—everything is passively inferred based on behavioral chains.

### 2. Intervention Engine (The "Moderator")
- **What it does:** Automatically intercepts destructive behavioral chains (e.g., jumping from email to news to social media).
- **Evaluation Point:** Explain that the twin doesn't simply block apps; it steps in when the real-time "Risk Score" passes a threshold, deploying "Intent Gates."

### 3. Simulation Engine (The "Oracle")
- **What it does:** Provides "What-If" scenarios based on current state.
- **Evaluation Point:** If the user feels tired, they can simulate "focus" vs. "rest". The engine calculates probabilistic outcomes (e.g., future sleep quality, tasks completed) based on the user's historical data (Habit DNA).

---

## 💻 Frontend Features & User Interaction Guide

Present the following dashboards and features to the evaluator in order:

### A. The Real-time Dashboard & Mood Fingerprint
- **Flow:** The user dashboard greets you with your real-time "Digital Twin". 
- **Explain to Evaluator:** Point to the **Mood Fingerprint** tile. Explain that it updates based on typing speed and contextual app-switching rate. If the user rapidly switches apps, the anxiety index rises and the twin visibly degrades into a "distracted" visual state.

### B. Twin Divergence Gauge
- **Flow:** Central visual component showing $+/-$ score.
- **Explain to Evaluator:** This score compares the user’s actions today with their optimal (focused) self. If they consistently choose "deep work," the divergence score is positive, meaning they are aligned with their best self.

### C. Shadow Self Comparison
- **Flow:** Navigate to the "Shadow Self" module.
- **Explain to Evaluator:** This is the most powerful "What-If" visual. It forks reality into two timelines: the Focused Twin and the Distracted Twin. Show the evaluator the projected metrics 2 hours into the future, comparing focus gap and task gap side-by-side.

### D. Success Archaeology
- **Flow:** Open the Success Archaeology module.
- **Explain to Evaluator:** Instead of showing failures, the Twin digs up historical "Super Days." The system might report: *“A 10-minute walk after lab sessions leads to 2+ hours of deep work 78% of the time.”* This showcases the application of ML on personal historical logs.

### E. Intent Gates (Micro-Interventions)
- **Flow:** Trigger a distraction (e.g., click into social media).
- **Explain to Evaluator:** A modal pops up asking "Are you sure you want to doomscroll?" Tell the evaluator this isn't an app blocker. It’s an **Intent Validator**. If the user explicitly selects "Intentional Rest," the twin respects it, teaching the model the difference between compulsive distraction and planned breaks.

---

## 🛠 ML Predictive Pipeline (Behind the Scenes)
- **The Engine:** Uses a localized Random Forest model trained on sequences of habits.
- **To the Evaluator:** Emphasize that all data processing is localized and respects privacy. The system predicts the *next* app in the chain and generates a risk score before the user even takes action.

## 🏁 Final Evaluation Closing Statement
When wrapping up the evaluation:
*"The Digital Twin of You isn't a rigid productivity tracker—it's a compassionate, predictive mirror. It learns from you, steps in when you're about to spiral, and empowers you to choose your trajectory through data-driven 'Shadow' simulations."*
