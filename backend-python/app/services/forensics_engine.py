import hashlib
from pypdf import PdfReader
from app.services.ai_scanner import ai_engine # Gemini integration use karenge

class DocumentForensics:
    def calculate_hash(self, file_path):
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    async def analyze_document(self, file_path):
        reader = PdfReader(file_path)
        metadata = reader.metadata
        anomalies = []
        
        # 1. Metadata Check (Direct Evidence)
        # Agar producer mein "Photoshop" ya "Canva" dikha, toh red flag
        software_used = metadata.get('/Producer', 'Unknown')
        if any(x in software_used for x in ["Photoshop", "Canvas", "Edit"]):
            anomalies.append(f"Suspicious Software Detected: {software_used}")

        # 2. OCR/Visual Check via Gemini
        # Hum pehle page ka text Gemini ko bhejenge inconsistency check karne
        text_sample = "".join([page.extract_text() for page in reader.pages[:1]])
        ai_analysis = await ai_engine.llm.ainvoke(
            f"Analyze this document text for financial forgery. Look for inconsistent currency symbols, "
            f"misaligned dates, or font variations: {text_sample}"
        )
        
        if "suspicious" in ai_analysis.content.lower():
            anomalies.append("AI detected visual/logical inconsistencies in text.")

        # 3. Verdict Logic
        confidence = 90 if len(anomalies) > 0 else 10
        verdict = "FORGED" if len(anomalies) > 1 else ("SUSPICIOUS" if len(anomalies) == 1 else "GENUINE")

        return {
            "is_tampered": len(anomalies) > 0,
            "confidence_score": confidence,
            "anomalies": anomalies,
            "metadata": {
                "author": metadata.get('/Author', 'N/A'),
                "software": software_used,
                "hash": self.calculate_hash(file_path)
            },
            "verdict": verdict
        }

forensics_engine = DocumentForensics()