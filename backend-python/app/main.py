from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Apne auth router ko import karna zaruri hai
from app.api.v1 import auth

# Apne security router ko import karna zaruri haifrom app.api.v1 import security
from app.api.v1 import auth, security

# Env variables load karo
load_dotenv()

app = FastAPI(title="SuRaksha Python Engine")

# CORS setup (MERN aur Frontend ko connect karne ke liye mandatory)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production mein ise specific domain kar denge
    allow_methods=["*"],
    allow_headers=["*"],
)


# Connecting the routes (Dhyan rakhna, function ka naam include_router hai)
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
# Security router ko bhi include karna hai
app.include_router(security.router, prefix="/api/v1/security", tags=["Security & Privacy"])

# Root health check endpoint (Sab merge kar diya yahan)
@app.get("/")
async def status():
    return {
        "status": "Online",
        "api_key_loaded": bool(os.getenv("GOOGLE_API_KEY")),
        "port": os.getenv("PORT", 8000),  # Agar .env mein port nahi mila toh default 8000 lega
        "environment": os.getenv("ENVIRONMENT", "development")
    }