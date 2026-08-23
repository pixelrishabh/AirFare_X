from typing import Any

class Predictor:
    """Placeholder interface for the trained model. Only this file changes when
    the real model arrives — nothing in the route or the frontend contract should."""

    def __init__(self):
        self.model = None
        self._load_if_available()

    def _load_if_available(self):
        # TODO: once a real model file exists in app/ml/models/, load it here.
        self.model = None

    def predict(self, payload: dict) -> Any:
        if self.model is None:
            return {"prediction": None, "note": "model not loaded yet"}
        raise NotImplementedError

predictor = Predictor()
