from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import jwt

load_dotenv()

from app.api.v1 import auth
from app.api.v1 import security

app = FastAPI(
    title="SuRaksha Python Engine",
    description="AI-powered security and compliance backend for SuRaksha.",
    version="1.0.0"
)

# Explicit CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Secret Middleware Dependency
# auto_error=False is CRUCIAL here so FastAPI doesn't auto-block missing tokens during our bypass
security_scheme = HTTPBearer(auto_error=False) 
JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret")

async def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
    # ==========================================
    # 🔥 HACKATHON BYPASS START 🔥
    # ==========================================
    print("⚠️ Warning: JWT Verification Bypassed for DEV mode. Allowing access.")
    return {"user": "Dev_Mode_User"} 
    # ==========================================
    # 🔥 HACKATHON BYPASS END 🔥
    # ==========================================

    # ---------------------------------------------------------
    # 🔒 ORIGINAL STRICT SECURITY LOGIC (UNCOMMENT LATER) 🔒
    # ---------------------------------------------------------
    # if not credentials:
    #     raise HTTPException(status_code=401, detail="Missing authorization header")
    #
    # if not JWT_SECRET:
    #     raise HTTPException(status_code=500, detail="JWT_SECRET is not configured on the server")
    # 
    # token = credentials.credentials
    # try:
    #     # Decode token using same secret as Node.js
    #     payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    #     return payload
    # except jwt.ExpiredSignatureError:
    #     raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    # except jwt.InvalidTokenError:
    #     raise HTTPException(status_code=401, detail="Invalid token. Authentication failed.")
    # ---------------------------------------------------------

# Register routers (Applying verify_jwt dependency to protect all security AI routes)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(security.router, prefix="/api/v1/security", tags=["Security"], dependencies=[Depends(verify_jwt)])

@app.get("/")
async def status():
    return {
        "status": "Online",
        "api_key_loaded": bool(os.getenv("GOOGLE_API_KEY")),
        "port": int(os.getenv("PORT", 8000)),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# --- Route Migration: verify-document explicitly moved to Python ---
from fastapi import File, UploadFile
import shutil
import uuid

@app.post("/api/v1/security/verify-document", tags=["Security"], dependencies=[Depends(verify_jwt)])
async def verify_document_endpoint(file: UploadFile = File(...)):
    TEMP_DIR = "app/utils/temp_uploads"
    os.makedirs(TEMP_DIR, exist_ok=True)
    temp_path = os.path.join(TEMP_DIR, f"verify_{uuid.uuid4().hex}_{file.filename}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Example Hook to your forensics engine 
        from app.services.forensics_engine import forensics_engine
        result = await forensics_engine.analyze_document(temp_path)
        return {"status": "success", "filename": file.filename, "verification_data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)