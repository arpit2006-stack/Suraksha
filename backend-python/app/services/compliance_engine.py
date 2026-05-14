import os
from pypdf import PdfReader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

# --- Model Configuration ---
# gemini-1.5-flash was SHUT DOWN. Using gemini-2.5-flash (stable, production).
# For compliance summarization: gemini-2.5-flash offers strong reasoning over long documents.
MODEL_COMPLIANCE = "gemini-2.5-flash"

_api_key = os.getenv("GOOGLE_API_KEY")
if not _api_key:
    raise EnvironmentError("GOOGLE_API_KEY is not set. Please configure your .env file.")

class HybridComplianceAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=MODEL_COMPLIANCE,
            google_api_key=_api_key,
            temperature=0.2,
            max_retries=3,
        )
        self.local_vault = "app/utils/regulatory_vault/"

    async def get_circular(self, mode: str = "hybrid") -> str:
        """
        Fetches a regulatory circular.
        - 'local'  : picks first file from the local vault folder.
        - 'live'   : placeholder for live RBI scraping (falls back to local on failure).
        - 'hybrid' : tries live first, falls back to local.
        """
        if mode == "local":
            return self._get_local_file()

        if mode == "live":
            # Live scraping logic (placeholder) - falls back to local
            try:
                # TODO: Implement live RBI circular fetch here
                raise NotImplementedError("Live RBI fetch not yet implemented.")
            except Exception:
                return self._get_local_file()

        # hybrid: try live, fall back to local
        try:
            raise NotImplementedError("Live RBI fetch not yet implemented.")
        except Exception:
            return self._get_local_file()

    def _get_local_file(self) -> str:
        """Returns the path to the first PDF found in the local vault."""
        if not os.path.isdir(self.local_vault):
            raise FileNotFoundError(
                f"Regulatory vault directory not found: {self.local_vault}"
            )
        files = [f for f in os.listdir(self.local_vault) if f.endswith(".pdf")]
        if not files:
            raise FileNotFoundError(
                "No PDF files found in regulatory vault. "
                "Please add RBI circular PDFs to app/utils/regulatory_vault/"
            )
        return os.path.join(self.local_vault, files[0])

    async def analyze_and_notify(self, file_path: str) -> dict:
        """
        Reads a PDF and asks Gemini to summarize it for a Legal Team.
        Returns a dict with source, summary, and workflow status.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Document not found: {file_path}")

        reader = PdfReader(file_path)
        # Join only non-None page text to avoid NoneType concatenation errors
        text_parts = [page.extract_text() or "" for page in reader.pages[:3]]
        text = "".join(text_parts)

        if not text.strip():
            raise ValueError("Could not extract any text from the provided PDF.")

        prompt = PromptTemplate.from_template(
            "Summarize this RBI Circular for a Legal Team. "
            "List: 1. Core Rule Change 2. Affected Departments 3. Deadline. "
            "Circular Text: {text}"
        )

        chain = prompt | self.llm
        # Use ainvoke for true async execution
        summary = await chain.ainvoke({"text": text[:8000]})

        return {
            "source": "Local Vault" if "vault" in file_path else "Live RBI",
            "summary": summary.content,
            "status": "AWAITING_LEGAL_APPROVAL"
        }


compliance_agent = HybridComplianceAgent()