import os
import io
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
from langchain_google_genai import ChatGoogleGenerativeAI

class HybridComplianceAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.1
        )
        self.rbi_rss_url = "https://www.rbi.org.in/Scripts/RSS.aspx?Id=8"
        self.vault_path = "app/utils/regulatory_vault/"

    async def fetch_live_circulars_list(self):
        """Fetches latest 3 circulars via BeautifulSoup scraping of RBI website."""
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            url = "https://www.rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx"
            res = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(res.text, 'html.parser')
            
            table = soup.find('table', {'class': 'tablebg'})
            rows = table.find_all('tr') if table else soup.find_all('tr')
            
            links = []
            for r in rows:
                a_tag = r.find('a')
                if a_tag:
                    tds = r.find_all('td')
                    if len(tds) >= 4:
                        circular_id = tds[0].text.strip()
                        date = tds[1].text.strip()
                        title = tds[3].text.strip()
                        href = a_tag.get('href')
                        full_link = f"https://www.rbi.org.in/Scripts/{href}" if href else ""
                        
                        links.append({
                            "title": f"{circular_id}: {title}",
                            "id": f"RBI/LIVE/{os.urandom(2).hex()}",
                            "link": full_link,
                            "date": date
                        })
                if len(links) >= 3:
                    break
            return links
        except Exception as e:
            print(f"Scraping Error: {e}")
            return []

    async def analyze_live_circular(self, pdf_url: str, title: str):
        """Downloads and audits the PDF using Gemini 2.5."""
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            res = requests.get(pdf_url, headers=headers, timeout=10)
            if not res.content.startswith(b'%PDF'):
                raise Exception("Not a PDF")

            with io.BytesIO(res.content) as f:
                reader = PdfReader(f)
                text = "".join([p.extract_text() or "" for p in reader.pages[:3]])
            
            ans = await self.llm.ainvoke(f"Summarize this RBI circular and give 3 action points: {title}. Content: {text[:6000]}")
            return {"summary": ans.content, "source": "RBI RSS Official"}
        except:
            # Fallback to AI knowledge if download fails
            ans = await self.llm.ainvoke(f"Analyze this RBI circular title based on your knowledge: {title}")
            return {"summary": ans.content, "source": "Gemini Knowledge Base"}

    async def get_specific_circular(self, circular_id: str):
        if not os.path.exists(self.vault_path): os.makedirs(self.vault_path)
        local_files = os.listdir(self.vault_path)
        for f in local_files:
            if circular_id.replace("/", "_") in f: return os.path.join(self.vault_path, f)
        return os.path.join(self.vault_path, local_files[0]) if local_files else None

    async def analyze_and_notify(self, file_path: str, title: str):
        reader = PdfReader(file_path)
        text = "".join([p.extract_text() or "" for p in reader.pages[:3]])
        ans = await self.llm.ainvoke(f"Audit this local doc: {title}. Text: {text[:5000]}")
        return {"summary": ans.content, "source": "Local Vault", "status": "APPROVED"}

    async def _get_ai_fallback_analysis(self, title: str):
        res = await self.llm.ainvoke(f"Based on title '{title}', what are the compliance needs?")
        return {"summary": res.content, "source": "AI Prediction"}

compliance_agent = HybridComplianceAgent()