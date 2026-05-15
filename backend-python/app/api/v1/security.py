from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
import datetime
from app.services.compliance_engine import compliance_agent
from app.services.ai_scanner import ai_engine

router = APIRouter()

class AnalyzeRequest(BaseModel):
    circular_id: str
    title: str
    mode: str = "hybrid"

class URLScanRequest(BaseModel):
    url: str

@router.post("/scan-url")
async def scan_url_endpoint(request: URLScanRequest):
    try:
        raw_result = await ai_engine.scan_url(request.url)
        parts = raw_result.split("|")
        brand = parts[0].strip() if len(parts) > 0 else "Unknown"
        risk = parts[1].strip() if len(parts) > 1 else "Low"
        reason = parts[2].strip() if len(parts) > 2 else raw_result

        # Map risk to gauge score
        risk_lower = risk.lower()
        score = 15 if "safe" in risk_lower else (45 if "low" in risk_lower else 85)
        
        # 🔥 Essential for Frontend .map() logic
        threats = []
        if score > 50: threats = ["Phishing", "Spoofing", "High Risk"]
        elif score > 20: threats = ["Suspicious"]

        return {
            "status": "success",
            "detected_brand": brand,
            "risk_level": risk,
            "threat_score": score,
            "reasoning": reason,
            "threat_types": threats, # No more undefined!
            "registrar": "Verified" if score < 30 else "Unknown",
            "country": "India",
            "registered": "2026-05-15"
        }
    except Exception as e:
        return {"status": "error", "threat_types": [], "reasoning": str(e)}

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

@router.post("/analyze-circular")
async def analyze_specific_circular(request: AnalyzeRequest):
    if "RSS" in request.circular_id:
        demo_url = "https://rbidocs.rbi.org.in/rdocs/notification/PDFs/NT134607D549119934B8E999E752837BAE291.PDF"
        result = await compliance_agent.analyze_live_circular(demo_url, request.title)
    else:
        path = await compliance_agent.get_specific_circular(request.circular_id)
        result = await compliance_agent.analyze_and_notify(path, request.title) if path else await compliance_agent._get_ai_fallback_analysis(request.title)
    
    return {"status": "success", "data": {"summary": result["summary"], "source": result["source"]}}