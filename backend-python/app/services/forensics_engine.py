import hashlib
import os
from pypdf import PdfReader
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# --- Model Configuration ---
# Document forensics requires STRONGER reasoning than URL scanning.
# gemini-2.5-flash has sufficient reasoning for detecting forgery clues in text.
# If you need deeper analysis (e.g. vision-based on scanned images), upgrade to gemini-2.5-pro.
MODEL_FORENSICS = "gemini-2.5-flash"

_api_key = os.getenv("GOOGLE_API_KEY")
if not _api_key:
    raise EnvironmentError("GOOGLE_API_KEY is not set. Please configure your .env file.")


class DocumentForensics:

    def __init__(self):
        # Dedicated LLM instance for forensics — independent of ai_scanner
        self.llm = ChatGoogleGenerativeAI(
            model=MODEL_FORENSICS,
            google_api_key=_api_key,
            temperature=0.1,   # Very low temp: forensics needs consistent, factual answers
            max_retries=3,
        )

    def calculate_hash(self, file_path: str) -> str:
        """Returns SHA-256 hash of the file at file_path."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    async def analyze_document(self, file_path: str) -> dict:
        """
        Runs forensic analysis on a PDF document:
          1. Checks metadata for suspicious authoring software.
          2. Sends page text to Gemini (gemini-2.5-flash) for AI-based forgery detection.
          3. Returns a structured verdict.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Document not found: {file_path}")

        reader = PdfReader(file_path)
        metadata = reader.metadata or {}
        anomalies = []

        # --- 1. Metadata Check ---
        # Flag documents created/edited by image manipulation tools
        software_used = metadata.get("/Producer", "") or metadata.get("/Creator", "") or "Unknown"
        SUSPICIOUS_TOOLS = ["Photoshop", "Canva", "GIMP", "Paint", "Edit", "Inkscape"]
        if any(tool.lower() in software_used.lower() for tool in SUSPICIOUS_TOOLS):
            anomalies.append(f"Suspicious Software Detected: {software_used}")

        # --- 2. AI / OCR Visual Check ---
        # Join page text safely (extract_text() can return None)
        text_parts = [page.extract_text() or "" for page in reader.pages[:1]]
        text_sample = "".join(text_parts).strip()

        if text_sample:
            ai_analysis = await self.llm.ainvoke(
                f"Analyze this document text for financial forgery. Look for inconsistent "
                f"currency symbols, misaligned dates, or font variations: {text_sample}"
            )
            if "suspicious" in ai_analysis.content.lower():
                anomalies.append("AI detected visual/logical inconsistencies in text.")
        else:
            anomalies.append("Document has no extractable text — possible scan or image-only PDF.")

        # --- 3. Verdict Logic ---
        # Scale confidence: 0 anomalies → 10, 1 → 60, 2+ → 90
        if len(anomalies) == 0:
            confidence = 10
            verdict = "GENUINE"
        elif len(anomalies) == 1:
            confidence = 60
            verdict = "SUSPICIOUS"
        else:
            confidence = 90
            verdict = "FORGED"

        return {
            "is_tampered": len(anomalies) > 0,
            "confidence_score": confidence,
            "detected_anomalies": anomalies,
            "metadata_summary": {
                "author": metadata.get("/Author", "N/A"),
                "software": software_used,
                "hash": self.calculate_hash(file_path)
            },
            "verdict": verdict
        }


forensics_engine = DocumentForensics()