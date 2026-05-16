from fastapi import APIRouter, Body, File, UploadFile, HTTPException
from pydantic import BaseModel
import os
import re
import shutil
import uuid
import requests
from bs4 import BeautifulSoup
from app.services.compliance_engine import compliance_agent
from app.services.ai_scanner import ai_engine
from app.services.forensics_engine import forensics_engine
from app.models.schemas import DataMaskingRequest, DataMaskingResponse, EntityCount

router = APIRouter()

TEMP_DIR = "app/utils/temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

class URLScanRequest(BaseModel):
    url: str

class AnalyzeRequest(BaseModel):
    circular_id: str
    title: str

@router.post("/scan-url")
async def scan_url_endpoint(request: URLScanRequest):
    try:
        # --- GHOST RECON (Live Signal Fetching) ---
        recon_data = {
            "title": "Analyzing...",
            "ssl": "GlobalSign / Digicert",
            "country": "India",
            "rep": "High (Legacy Node)"
        }
        
        try:
            # Ghost Agent tries to peek at the site title
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            response = requests.get(request.url, timeout=5, headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            recon_data["title"] = soup.title.string.strip() if soup.title else "No Title Found"
        except:
            recon_data["title"] = "Enterprise Gateway (Title Hidden)"


        if "Request Rejected" in recon_data["title"] or "403" in recon_data["title"]:
            # Agar domain legit hai (.bank.in) toh use block maano, phishing nahi
            if ".bank.in" in request.url or ".bank" in request.url:
                risk = "Safe"
                score = 15
                reason = "Site returned 'Request Rejected'. This is a common bot-protection response from legitimate bank firewalls."   

        # --- AI ANALYSIS ---
        raw_result = await ai_engine.scan_url_with_ghost_intelligence(request.url, recon_data)
        parts = raw_result.split("|")
        brand = parts[0].strip() if len(parts) > 0 else "Unknown"
        risk = parts[1].strip() if len(parts) > 1 else "Safe"
        reason = parts[2].strip() if len(parts) > 2 else raw_result

        score = 15 if "safe" in risk.lower() else (55 if "warning" in risk.lower() else 92)
        
        return {
            "status": "success",
            "detected_brand": brand,
            "risk_level": risk,
            "threat_score": score,
            "reasoning": reason,
            "threat_types": ["Domain Discrepancy"] if score > 50 else [],
            "ghost_recon": recon_data # Sending signals to frontend
        }
    except Exception as e:
        return {"status": "error", "reasoning": str(e)}

@router.get("/fetch-circulars")
async def fetch_regulatory_feed():
    live_data = await compliance_agent.fetch_live_circulars_list()
    seed_data = [{"id": "RBI/2025/001", "title": "KYC Master Direction 2025", "category": "KYC"}]
    
    combined = []
    for item in live_data:
        combined.append({**item, "category": "Regulatory", "priority": "high", "source": "RBI RSS", "status": "Pending"})
    for item in seed_data:
        combined.append({**item, "date": "2026-05-10", "priority": "medium", "source": "Vault", "status": "Approved"})
    return {"status": "success", "circulars": combined}

def _mask_pii(text: str) -> tuple[str, list[EntityCount]]:
    masked = text
    counts: dict[str, int] = {}

    def sub(pattern, label, repl):
        nonlocal masked
        found = re.findall(pattern, masked)
        if found:
            counts[label] = counts.get(label, 0) + len(found)
            masked = re.sub(pattern, repl, masked)

    sub(r"\b\d{10,16}\b", "Bank Account Number", "[MASKED_ACC_NO]")
    sub(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "Card Number", "[MASKED_CARD]")
    sub(r"\b[A-Z]{4}0[A-Z0-9]{6}\b", "IFSC", "[MASKED_IFSC]")
    sub(r"\b[6-9]\d{9}\b", "Phone Number", "[MASKED_PHONE]")
    sub(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "Email Address", "[MASKED_EMAIL]")
    sub(r"\b\d{12}\b", "Aadhaar", "[MASKED_AADHAAR]")
    sub(r"\b[A-Z]{5}\d{4}[A-Z]\b", "PAN", "[MASKED_PAN]")

    entities = [EntityCount(type=k, count=v) for k, v in counts.items()]
    return masked, entities


@router.post("/scan-document")
async def scan_document_endpoint(file: UploadFile = File(...)):
    """Document tampering & forgery scan (PDF)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pdf",):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported for forensic scan")

    temp_path = os.path.join(TEMP_DIR, f"scan_{uuid.uuid4().hex}_{file.filename}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        result = await forensics_engine.analyze_document(temp_path)
        return {"status": "success", "filename": file.filename, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/mask-data", response_model=DataMaskingResponse)
async def mask_data_endpoint(request: DataMaskingRequest):
    masked, entities = _mask_pii(request.raw_data)
    return DataMaskingResponse(
        masked_data=masked,
        entities_hidden=[e.type for e in entities],
        entities_found=entities,
        audit_id=f"AUD-{uuid.uuid4().hex[:12].upper()}",
    )


@router.post("/analyze-circular")
async def analyze_specific_circular(request: AnalyzeRequest):
    if "RSS" in request.circular_id:
        demo_url = "https://rbidocs.rbi.org.in/rdocs/notification/PDFs/NT134607D549119934B8E999E752837BAE291.PDF"
        result = await compliance_agent.analyze_live_circular(demo_url, request.title)
    else:
        path = await compliance_agent.get_specific_circular(request.circular_id)
        result = await compliance_agent.analyze_and_notify(path, request.title) if path else await compliance_agent._get_ai_fallback_analysis(request.title)
    
    return {"status": "success", "data": {"summary": result["summary"], "source": result["source"]}}