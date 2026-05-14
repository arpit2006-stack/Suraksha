import os
import shutil
from fastapi import APIRouter, HTTPException, Query, File, UploadFile

from app.models.schemas import (
    URLScanRequest,
    URLScanResponse,
    DataMaskingRequest,
    DataMaskingResponse
)
from app.services.ai_scanner import ai_engine
from app.services.compliance_engine import compliance_agent

router = APIRouter()

# Ensure upload temp dir exists
TEMP_DIR = "app/utils/temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)


# --- THEME 2: PRIVACY & DATA MASKING ---
@router.post("/mask-data", response_model=DataMaskingResponse)
async def mask_data(request: DataMaskingRequest):
    """
    Identifies and masks PII data to ensure responsible data sharing.
    """
    try:
        masked_result = await ai_engine.mask_sensitive_data(request.raw_data)
        return DataMaskingResponse(
            masked_data=masked_result,
            entities_hidden=["PII (Aadhaar/PAN/Account) Detected"],
            audit_id="AUDIT-" + os.urandom(4).hex().upper()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- SECURITY: UNIVERSAL PHISHING SCANNER ---
@router.post("/scan-url", response_model=URLScanResponse)
async def analyze_url(request: URLScanRequest):
    """
    Analyzes URLs using Gemini to detect financial phishing attempts.
    """
    try:
        result = await ai_engine.scan_url(request.url)
        # Case-insensitive check so "high" / "HIGH" both match
        is_high_risk = "high" in result.lower()
        return URLScanResponse(
            detected_brand="Detected Brand via AI",
            risk_level="High" if is_high_risk else "Low",
            threat_types=["Phishing", "Financial Fraud"],
            threat_score=90 if is_high_risk else 20,
            reasoning=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- PHASE 4: AGENTIC REGULATORY LOOP (The Hybrid Agent) ---
@router.post("/trigger-regulatory-scan")
async def trigger_regulatory_scan(
    mode: str = Query("hybrid", enum=["live", "local", "hybrid"])
):
    """
    Automatically fetches and analyzes RBI/DPDP guidelines.
    Supports Hybrid mode for stability.
    """
    try:
        # 1. Hybrid Fetching (Live search or Local Vault)
        file_path = await compliance_agent.get_circular(mode=mode)

        # 2. Agentic Analysis using Gemini
        audit_result = await compliance_agent.analyze_and_notify(file_path)

        return {
            "status": "success",
            "data": {
                "document_name": os.path.basename(file_path),
                "source": audit_result["source"],
                "summary": audit_result["summary"],
                "workflow_status": audit_result["status"],
                "next_step": "Awaiting Approval from Legal Dashboard"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regulatory Agent Error: {str(e)}")


# --- BONUS: MANUAL POLICY AUDIT ---
@router.post("/audit-manual-pdf")
async def audit_manual_pdf(file: UploadFile = File(...)):
    """
    Allows manual upload of compliance documents for instant AI auditing.
    """
    temp_path = os.path.join(TEMP_DIR, file.filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        analysis = await compliance_agent.analyze_and_notify(temp_path)
        return {"status": "Success", "analysis": analysis["summary"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Guaranteed cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)