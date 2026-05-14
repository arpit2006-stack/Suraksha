import os
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException

from app.services.forensics_engine import forensics_engine

router = APIRouter()

# Ensure the temp upload directory exists
TEMP_DIR = "app/utils/temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)


@router.post("/verify-document")
async def verify_doc(file: UploadFile = File(...)):
    """
    Accepts a PDF document and runs forensic analysis on it
    to detect tampering, metadata anomalies, and AI-flagged forgeries.
    """
    # Build a safe, unique temp path to avoid filename collisions
    temp_path = os.path.join(TEMP_DIR, f"temp_{file.filename}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = await forensics_engine.analyze_document(temp_path)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Always clean up the temp file, even if an error occurred
        if os.path.exists(temp_path):
            os.remove(temp_path)