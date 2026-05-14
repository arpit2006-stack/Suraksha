import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

class BBAManager:
    def __init__(self):
        self.model_path = "app/services/bba_model.joblib"
        # Agar model hai toh load karo, warna naya initialize karo
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.model = IsolationForest(contamination=0.1, random_state=42)

    def predict_anomaly(self, features: list):
        vector = np.array(features).reshape(1, -1)
        
        # Anomaly Score calculate karna
        raw_score = self.model.decision_function(vector)[0]
        prediction = self.model.predict(vector)[0] # -1 = Anomaly, 1 = Normal

        # Normalizing score (0 to 1) for MERN
        risk_score = float(1 - (raw_score + 0.5))
        risk_score = max(0.0, min(1.0, risk_score))
        
        return risk_score, bool(prediction == -1)

bba_manager = BBAManager()