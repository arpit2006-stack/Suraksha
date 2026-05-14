import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

class AISecurityEngine:
    def __init__(self):
        # Gemini setup
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

    async def scan_url(self, url: str):
        """URL ka post-mortem karke brand aur risk level batayega"""
        prompt = PromptTemplate.from_template(
            "Analyze this URL for financial phishing: {url}. "
            "Identify: 1. Target Brand 2. Risk Level (Low/High) 3. Reasoning. "
            "Output format: Brand | Risk | Reason"
        )
        chain = prompt | self.llm
        response = chain.invoke({"url": url})
        return response.content

    async def mask_sensitive_data(self, text: str):
        """Sensitive information (PII) ko mask karne ke liye"""
        prompt = PromptTemplate.from_template(
            "Identify PII (Aadhaar, PAN, Account Numbers) in this text: {text}. "
            "Return the text with sensitive info replaced by [MASKED]. "
            "Also list what was hidden."
        )
        chain = prompt | self.llm
        response = chain.invoke({"text": text})
        return response.content

ai_engine = AISecurityEngine()