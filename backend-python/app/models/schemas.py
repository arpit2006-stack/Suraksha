from pydantic import BaseModel, Field
from typing import List, Optional

# --- THEME 1: BEHAVIORAL AUTH (BBA) ---
class TelemetryData(BaseModel):
    user_id: str
    device_id: str
    # Metrics: [dwell_time, flight_time] or raw touch pressure
    keystroke_dynamics: List[float] = Field(..., description="Intervals between keys")
    touch_patterns: List[float] = Field(..., description="Pressure and area data")
    scroll_velocity: float
    current_lat: Optional[float] = None
    current_long: Optional[float] = None

class BBAResponse(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: str # 'Low', 'Medium', 'High', 'Critical'
    is_anomaly: bool
    recommended_action: str # 'ALLOW', 'RE_VERIFY', 'TERMINATE'
    reason: str

# --- SECURITY: UNIVERSAL URL SCANNER ---
class URLScanRequest(BaseModel):
    url: str
    user_id: Optional[str] = None  # Optional — frontend may not always send this

class URLScanResponse(BaseModel):
    detected_brand: str
    risk_level: str
    threat_types: List[str]
    threat_score: int
    reasoning: str

# --- THEME 2: PRIVACY & MASKING ---
class DataMaskingRequest(BaseModel):
    raw_data: str
    purpose: Optional[str] = "General"  # Optional with default
    masking_level: str = "Standard"

class EntityCount(BaseModel):
    type: str
    count: int

class DataMaskingResponse(BaseModel):
    masked_data: str
    entities_hidden: List[str]   # kept for backward compat
    entities_found: List[EntityCount] = []  # required by frontend
    audit_id: str

# --- COMPLIANCE: PDF AUDITOR ---
class ComplianceTask(BaseModel):
    department: str
    action_point: str
    priority: str
    deadline: Optional[str] = None

class PDFComplianceResponse(BaseModel):
    status: str
    filename: str
    analysis: List[ComplianceTask]
    compliance_score: int

# --- DOCUMENT FORENSICS (matches frontend DocumentVerifier.jsx) ---
class AnomalyItem(BaseModel):
    type: str
    detail: str
    severity: str  # 'high', 'medium', 'low'

class HashVerification(BaseModel):
    sha256: str
    md5: str
    is_valid: bool

class DocumentVerifyResponse(BaseModel):
    status: str            # "GENUINE", "SUSPICIOUS", "FORGED"
    confidence: float      # 0 to 100
    anomalies: List[AnomalyItem]
    hash_verification: HashVerification
    metadata: dict