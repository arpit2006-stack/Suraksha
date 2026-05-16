import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

class AISecurityEngine:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.1
        )

    async def scan_url_with_ghost_intelligence(self, url: str, metadata: dict) -> str:
        """
        Ghost Intelligence Engine:
        Analyzes URL + Live Signals (Title, SSL, Reputation).
        """
        prompt = PromptTemplate.from_template(
            """
            Role: Ghost AI Security Agent
            Task: Analyze if this URL is a phishing attempt using Live Recon Signals.
            
            URL: {url}
            Live Site Title: {title}
            SSL Identity: {ssl}
            Server Context: {country}

            LOGIC:
            1. Compare the 'Live Site Title' with the 'URL Domain'. 
            2. Legitimate banks (like PNB, ICICI) often use .com for legacy. If the Title matches the Brand and the SSL is from a global authority, mark as SAFE.
            3. If the Title says 'HDFC Bank' but the URL is 'secure-hdfc.xyz', flag as DANGEROUS.
            4. Look for 'punycode' or 'homograph' attacks (e.g., using 'rn' instead of 'm').
            5. If the Site Title is 'Request Rejected', 'Access Denied', or '403 Forbidden', it means the bank's firewall blocked our bot. 
            In this case, do NOT flag it as 'Dangerous' based on title mismatch alone. 
            Check the SSL and TLD. If the URL is '.bank.in' and SSL is valid, mark as SAFE but mention 'Bot Blocked' in reasoning.

            Output Format:
            Brand Name | Risk Level (Safe/Warning/Dangerous) | Ghost Reasoning (Max 2 lines)
            """
        )
        chain = prompt | self.llm
        try:
            response = await chain.ainvoke({
                "url": url, 
                "title": metadata.get('title', 'Unknown'),
                "ssl": metadata.get('ssl', 'GlobalSign/Digicert'),
                "country": metadata.get('country', 'India')
            })
            return response.content
        except Exception as e:
            return f"Unknown | Error | {str(e)}"

    async def mask_sensitive_data(self, text: str) -> str:
        prompt = PromptTemplate.from_template("Mask PII digits in: {text}. Return masked version.")
        response = await self.llm.ainvoke(prompt)
        return response.content

ai_engine = AISecurityEngine()