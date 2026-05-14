import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Validate API key at startup so the error is caught early
_api_key = os.getenv("GOOGLE_API_KEY")
if not _api_key:
    raise EnvironmentError("GOOGLE_API_KEY is not set. Please configure your .env file.")


# --- Model Configuration ---
# gemini-1.5-flash was SHUT DOWN. Using gemini-2.5-flash (stable, production).
# For URL scanning and PII masking: gemini-2.5-flash is ideal (fast, accurate, cost-effective).
MODEL_FAST = "gemini-2.5-flash"


class AISecurityEngine:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=MODEL_FAST,
            google_api_key=_api_key,
            temperature=0.2,       # Lower temp = more deterministic/reliable security analysis
            max_retries=3,         # Retry on transient API failures
        )

    async def scan_url(self, url: str) -> str:
        """Analyzes a URL for financial phishing. Returns AI reasoning string."""
        prompt = PromptTemplate.from_template(
            "Analyze this URL for financial phishing: {url}. "
            "Identify: 1. Target Brand 2. Risk Level (Low/High) 3. Reasoning. "
            "Output format: Brand | Risk | Reason"
        )
        chain = prompt | self.llm
        # Use ainvoke for true async execution (avoids blocking the event loop)
        response = await chain.ainvoke({"url": url})
        return response.content

    async def mask_sensitive_data(self, text: str) -> str:
        """Replaces PII (Aadhaar, PAN, Account Numbers) with [MASKED] tags."""
        prompt = PromptTemplate.from_template(
            "Identify PII (Aadhaar, PAN, Account Numbers) in this text: {text}. "
            "Return the text with sensitive info replaced by [MASKED]. "
            "Also list what was hidden."
        )
        chain = prompt | self.llm
        # Use ainvoke for true async execution
        response = await chain.ainvoke({"text": text})
        return response.content


ai_engine = AISecurityEngine()