import os
import shutil
import datetime
from fastapi import APIRouter, HTTPException, Query, File, UploadFile

from app.models.schemas import (
    URLScanRequest,
    URLScanResponse,
    DataMaskingRequest,
    DataMaskingResponse,
    EntityCount,
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

        # Parse entity counts from AI response (keyword matching)
        entity_map = {
            "aadhaar": "Aadhaar Number",
            "pan": "PAN Card",
            "account": "Bank Account",
            "phone": "Phone Number",
            "email": "Email Address",
            "ifsc": "IFSC Code",
            "card": "Credit/Debit Card",
        }
        entities_found = []
        lower_result = masked_result.lower()
        for key, label in entity_map.items():
            if key in lower_result:
                entities_found.append(EntityCount(type=label, count=1))

        return DataMaskingResponse(
            masked_data=masked_result,
            entities_hidden=[e.type for e in entities_found] or ["PII Detected"],
            entities_found=entities_found,
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
    Falls back to seed data if vault is empty.
    """
    try:
        # 1. Hybrid Fetching (Live search or Local Vault)
        file_path = await compliance_agent.get_circular(mode=mode)

        # 2. Agentic Analysis using Gemini
        audit_result = await compliance_agent.analyze_and_notify(file_path)

        # 3. Return in the format frontend expects: { circulars: [...] }
        return {
            "status": "success",
            "circulars": [
                {
                    "id": f"RBI/{os.path.basename(file_path).replace('.pdf', '')}",
                    "title": (audit_result["summary"] or "")[:120] or "RBI Circular Analysis",
                    "date": datetime.date.today().isoformat(),
                    "category": "Regulatory",
                    "priority": "high",
                    "status": "Pending Review",
                    "full_summary": audit_result["summary"],
                    "source": audit_result["source"],
                    "workflow_status": audit_result["status"],
                }
            ]
        }

    except FileNotFoundError:
        # Vault is empty — return realistic seed data so frontend can still work
        return {
            "status": "success",
            "source": "Seed Data (Add PDFs to app/utils/regulatory_vault/ for live AI analysis)",
            "circulars": [
                {
                    "id": "RBI/2025-26/001",
                    "title": "Master Direction – KYC Direction, 2025 Amendment",
                    "date": "2025-05-01",
                    "category": "KYC/AML",
                    "priority": "critical",
                    "status": "Pending Review",
                    "full_summary": "Enhanced KYC norms for all banks. Video KYC mandatory for accounts above ₹1 lakh.",
                    "source": "Seed Data",
                    "workflow_status": "AWAITING_LEGAL_APPROVAL",
                },
                {
                    "id": "RBI/2025-26/012",
                    "title": "Guidelines on Digital Lending – Data Privacy Clause Update",
                    "date": "2025-04-18",
                    "category": "Data Privacy",
                    "priority": "high",
                    "status": "Pending Review",
                    "full_summary": "Data privacy norms updated for digital lending per DPDP Act 2023.",
                    "source": "Seed Data",
                    "workflow_status": "AWAITING_LEGAL_APPROVAL",
                },
                {
                    "id": "RBI/2025-26/023",
                    "title": "Cyber Security Framework for Urban Co-operative Banks",
                    "date": "2025-03-30",
                    "category": "Cyber Security",
                    "priority": "high",
                    "status": "Approved",
                    "full_summary": "Mandatory quarterly penetration testing for all UCBs with internet banking.",
                    "source": "Seed Data",
                    "workflow_status": "APPROVED",
                },
                {
                    "id": "SEBI/HO/2025/034",
                    "title": "Prevention of Insider Trading Regulations – System Audit Mandate",
                    "date": "2025-02-14",
                    "category": "Compliance",
                    "priority": "medium",
                    "status": "Approved",
                    "full_summary": "System-level audit for insider trading surveillance now mandatory.",
                    "source": "Seed Data",
                    "workflow_status": "APPROVED",
                },
                {
                    "id": "RBI/2025-26/045",
                    "title": "Prudential Norms on Stressed Asset Classification (NPA)",
                    "date": "2025-01-22",
                    "category": "Prudential",
                    "priority": "medium",
                    "status": "Pending Review",
                    "full_summary": "Updated NPA classification timeline from 90 to 60 days for MSMEs.",
                    "source": "Seed Data",
                    "workflow_status": "AWAITING_LEGAL_APPROVAL",
                },
            ]
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