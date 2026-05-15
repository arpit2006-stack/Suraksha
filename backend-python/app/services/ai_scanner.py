import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GOOGLE_API_KEY")

class AISecurityEngine:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=_api_key,
            temperature=0.1,  # Strict analysis
            max_retries=3,
        )

    async def scan_url(self, url: str) -> str:
        """Analyzes URL for phishing with banking context."""
        prompt = PromptTemplate.from_template(
            """
            Analyze this URL for financial phishing: {url}
            
            CONTEXT:
            - Official Indian banks use '.bank.in', '.bank', or '.co.in'.
            - HDFC Bank official: 'hdfc.bank.in'.
            - SBI official: 'sbi.co.in' or 'bank.sbi'.
            - Flag as SAFE if it's official. Flag as DANGEROUS if it's a spoof (e.g., hdfc-net-login.com).

            OUTPUT FORMAT (Strict):
            Brand Name | Risk Level (Safe/Low/High/Dangerous) | Brief Reason
            """
        )
        chain = prompt | self.llm
        try:
            response = await chain.ainvoke({"url": url})
            return response.content
        except Exception as e:
            return f"Unknown | Error | {str(e)}"

    async def mask_sensitive_data(self, text: str) -> str:
        """Masks Aadhaar, PAN, and Bank details."""
        prompt = PromptTemplate.from_template(
            "Identify and mask PII (Aadhaar, PAN, Account Numbers) in this text: {text}. "
            "Replace digits with [MASKED]. Provide the masked text and a list of hidden entities."
        )
        chain = prompt | self.llm
        response = await chain.ainvoke({"text": text})
        return response.content

ai_engine = AISecurityEngine()