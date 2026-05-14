from fastapi import APIRouter
from app.models.schemas import TelemetryData, BBAResponse
from app.services.ml_engine import bba_manager

router = APIRouter()

@router.post("/check-behavior", response_model=BBAResponse)
async def check_behavior(data: TelemetryData):
    # Data ko feature list mein convert karna
    features = data.keystroke_dynamics + data.touch_patterns + [data.scroll_velocity]
    
    risk_score, is_anomaly = bba_manager.predict_anomaly(features)
    
    # Simple logic to decide action
    action = "ALLOW"
    level = "Low"
    
    if risk_score > 0.7:
        action = "TERMINATE"
        level = "High"
    elif risk_score > 0.4:
        action = "RE_VERIFY"
        level = "Medium"

    return BBAResponse(
        risk_score=risk_score,
        risk_level=level,
        is_anomaly=is_anomaly,
        recommended_action=action
    )

