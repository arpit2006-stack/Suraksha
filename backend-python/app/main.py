from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load env variables first, before importing anything that uses them
load_dotenv()

# Import routers
from app.api.v1 import auth
from app.api.v1 import security

app = FastAPI(
    title="SuRaksha Python Engine",
    description="AI-powered security and compliance backend for SuRaksha.",
    version="1.0.0"
)

# CORS setup (required for frontend + MERN integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Lock to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(security.router, prefix="/api/v1/security", tags=["Security"])

# Root health check endpoint
@app.get("/")
async def status():
    return {
        "status": "Online",
        "api_key_loaded": bool(os.getenv("GOOGLE_API_KEY")),
        "port": int(os.getenv("PORT", 8000)),
        "environment": os.getenv("ENVIRONMENT", "development")
    }