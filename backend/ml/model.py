import joblib
import os
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), "encoders.pkl")

LABEL_NAMES = ["deep_work", "distraction", "rest_needed", "burnout_risk"]
FEATURE_COLS = [
    "hour_of_day", "day_of_week", "location_enc", "app_category_enc",
    "prev_app_category_enc", "dwell_time", "stress_proxy",
    "typing_speed", "notification_response_time", "battery_level"
]


class DigitalTwinModel:
    def __init__(self):
        self.model = None
        self.encoders = {}
        self.feature_importances = {}

    def _encode_features(self, df: pd.DataFrame, fit=False):
        categorical_cols = ["location", "app_category", "prev_app_category"]
        df = df.copy()

        for col in categorical_cols:
            enc_col = col + "_enc"
            if fit:
                le = LabelEncoder()
                df[enc_col] = le.fit_transform(df[col].fillna("unknown"))
                self.encoders[col] = le
            else:
                le = self.encoders.get(col)
                if le:
                    df[enc_col] = df[col].apply(
                        lambda x: le.transform([x])[0] if x in le.classes_ else 0
                    )
                else:
                    df[enc_col] = 0
        return df

    def train(self, df: pd.DataFrame):
        """Train Decision Tree on behavioral data."""
        df = self._encode_features(df, fit=True)

        label_map = {name: i for i, name in enumerate(LABEL_NAMES)}
        y = df["label"].map(label_map).fillna(1).astype(int)
        X = df[FEATURE_COLS]

        self.model = DecisionTreeClassifier(
            max_depth=8,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=42
        )
        self.model.fit(X, y)

        importances = self.model.feature_importances_
        self.feature_importances = dict(zip(FEATURE_COLS, importances))

        print(f"[Model] Trained on {len(df)} samples. Accuracy will be computed during eval.")
        return self

    def predict(self, features: dict):
        """Predict from a raw features dict."""
        df = pd.DataFrame([features])
        df = self._encode_features(df, fit=False)

        for col in FEATURE_COLS:
            if col not in df.columns:
                df[col] = 0

        X = df[FEATURE_COLS]
        proba = self.model.predict_proba(X)[0]
        pred_idx = int(np.argmax(proba))

        return {
            "prediction": LABEL_NAMES[pred_idx],
            "risk_score": round(float(proba[1]), 3),  # prob of distraction
            "confidence": round(float(proba[pred_idx]), 3),
            "probabilities": {
                name: round(float(p), 3)
                for name, p in zip(LABEL_NAMES, proba)
            },
            "top_features": sorted(
                self.feature_importances.items(),
                key=lambda x: x[1], reverse=True
            )[:3]
        }

    def save(self):
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.encoders, ENCODERS_PATH)
        print(f"[Model] Saved to {MODEL_PATH}")

    def load(self):
        self.model = joblib.load(MODEL_PATH)
        self.encoders = joblib.load(ENCODERS_PATH)
        print("[Model] Loaded from disk.")
        return self

    def is_trained(self):
        return os.path.exists(MODEL_PATH) and os.path.exists(ENCODERS_PATH)
