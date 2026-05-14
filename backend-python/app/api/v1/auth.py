from fastapi import APIRouter, File, UploadFile
from app.services.forensics_engine import forensics_engine
import shutil
import os

router = APIRouter()

@router.post("/verify-document")
async def verify_doc(file: UploadFile = File(...)):
    # File save karo analysis ke liye
    temp_path = f"app/utils/temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        result = await forensics_engine.analyze_document(temp_path)
        os.remove(temp_path)
        return result
    except Exception as e:
        if os.path.exists(temp_path): os.remove(temp_path)
        return {"status": "error", "message": str(e)}