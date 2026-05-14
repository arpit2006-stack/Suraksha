import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os
import logging

logger = logging.getLogger(__name__)

MODEL_PATH = "app/services/bba_model.joblib"
# Minimum samples required before the IsolationForest model is considered trained
MIN_SAMPLES_FOR_PREDICT = 10


class BBAManager:
    def __init__(self):
        self.model_path = MODEL_PATH
        self._is_fitted = False

        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                self._is_fitted = True
                logger.info("BBA model loaded from disk.")
            except Exception as e:
                logger.warning(f"Failed to load BBA model: {e}. Initializing fresh model.")
                self.model = IsolationForest(contamination=0.1, random_state=42)
        else:
            logger.info("No BBA model found. Initialized a fresh IsolationForest (needs training).")
            self.model = IsolationForest(contamination=0.1, random_state=42)

    def predict_anomaly(self, features: list) -> tuple[float, bool]:
        """
        Predict whether the given feature vector is an anomaly.

        Returns:
            (risk_score, is_anomaly): risk_score in [0.0, 1.0], is_anomaly is True if flagged.

        Raises:
            RuntimeError: if the model has not been trained yet.
        """
        if not self._is_fitted:
            raise RuntimeError(
                "BBA model is not trained yet. "
                "Please train the model before calling predict_anomaly()."
            )

        vector = np.array(features, dtype=float).reshape(1, -1)

        raw_score = self.model.decision_function(vector)[0]
        prediction = self.model.predict(vector)[0]  # -1 = Anomaly, 1 = Normal

        # Normalize: decision_function range is roughly [-0.5, 0.5]
        # Map to [0, 1] where 1 = highest risk
        risk_score = float(1.0 - (raw_score + 0.5))
        risk_score = max(0.0, min(1.0, risk_score))

        return risk_score, bool(prediction == -1)

    def train(self, training_data: list[list[float]]) -> None:
        """
        Fit the IsolationForest on training_data and persist it to disk.

        Args:
            training_data: List of feature vectors (each a list of floats).
        """
        if len(training_data) < MIN_SAMPLES_FOR_PREDICT:
            raise ValueError(
                f"Need at least {MIN_SAMPLES_FOR_PREDICT} samples to train the BBA model. "
                f"Got {len(training_data)}."
            )

        X = np.array(training_data, dtype=float)
        self.model.fit(X)
        self._is_fitted = True

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        logger.info(f"BBA model trained on {len(training_data)} samples and saved to {self.model_path}.")


bba_manager = BBAManager()