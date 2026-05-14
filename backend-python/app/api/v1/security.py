from fastapi import APIRouter, HTTPException
from app.models.schemas import URLScanRequest, URLScanResponse, DataMaskingRequest, DataMaskingResponse
from app.services.ai_scanner import ai_engine

router = APIRouter()

@router.post("/scan-url", response_model=URLScanResponse)
async def analyze_url(request: URLScanRequest):
    try:
        # Gemini logic call karna
        result = await ai_engine.scan_url(request.url)
        # Result ko parse karke response bhejna (Simplified for Hackathon)
        return URLScanResponse(
            detected_brand="Detected",
            risk_level="High",
            threat_types=["Phishing"],
            threat_score=85,
            reasoning=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mask-data", response_model=DataMaskingResponse)
async def mask_data(request: DataMaskingRequest):
    try:
        masked_result = await ai_engine.mask_sensitive_data(request.raw_data)
        return DataMaskingResponse(
            masked_data=masked_result,
            entities_hidden=["PII Detected"],
            audit_id="AUDIT-" + os.urandom(4).hex()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        