import os
from pypdf import PdfReader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

class HybridComplianceAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.local_vault = "app/utils/regulatory_vault/"

    async def get_circular(self, mode="hybrid"):
        """
        Mode 'live': RBI site se fetch karega.
        Mode 'local': Folder se uthayega.
        Mode 'hybrid': Pehle live, fail hua toh local.
        """
        if mode == "local":
            # Folder mein jo pehli file mile use utha lo
            files = os.listdir(self.local_vault)
            return os.path.join(self.local_vault, files[0])
        
        # Yahan live scraping ka logic ayega (Hackathon ke liye ise 'Try-Except' mein rakhenge)
        return self.get_circular(mode="local") # Fallback

    async def analyze_and_notify(self, file_path: str):
        reader = PdfReader(file_path)
        text = "".join([page.extract_text() for page in reader.pages[:3]])

        prompt = PromptTemplate.from_template(
            "Summarize this RBI Circular for a Legal Team. "
            "List: 1. Core Rule Change 2. Affected Departments 3. Deadline. "
            "Circular Text: {text}"
        )
        
        chain = prompt | self.llm
        summary = chain.invoke({"text": text[:8000]})
        
        # MERN ko data bhejne ke liye structure
        return {
            "source": "Local Vault" if "vault" in file_path else "Live RBI",
            "summary": summary.content,
            "status": "AWAITING_LEGAL_APPROVAL"
        }

compliance_agent = HybridComplianceAgent()