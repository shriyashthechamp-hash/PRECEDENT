import os
import re
import io
import logging
from typing import List, Dict, Any, Optional
from pypdf import PdfReader
from docx import Document
from app.models.proposal import QuestionCategory

logger = logging.getLogger("precedent.rfp_parser")

CATEGORY_KEYWORDS = {
    QuestionCategory.COMPANY_INFO.value: ["company", "organization", "history", "leadership", "headquarters", "ownership", "overview"],
    QuestionCategory.PRODUCT_CAPABILITIES.value: ["feature", "functionality", "capability", "workflow", "integration", "ui", "export", "dashboard"],
    QuestionCategory.TECHNICAL_ARCHITECTURE.value: ["architecture", "infrastructure", "cloud", "api", "database", "stack", "deployment", "scalability"],
    QuestionCategory.SECURITY.value: ["security", "encryption", "aes", "penetration", "access control", "rbac", "mfa", "vulnerability", "audit"],
    QuestionCategory.COMPLIANCE.value: ["soc2", "iso", "hipaa", "compliance", "certif", "fedramp", "regulation", "attestation"],
    QuestionCategory.DATA_PRIVACY.value: ["privacy", "gdpr", "retention", "deletion", "purge", "pii", "phi", "residency", "dpa"],
    QuestionCategory.SLAS_AND_SUPPORT.value: ["sla", "support", "uptime", "availability", "escalation", "response time", "mttr", "business hours"],
    QuestionCategory.IMPLEMENTATION.value: ["implementation", "onboarding", "timeline", "training", "migration", "milestone", "deployment time"],
    QuestionCategory.PRICING_COMMERCIAL.value: ["pricing", "cost", "commercial", "fee", "license", "payment", "discount", "term", "contract"],
    QuestionCategory.EXPERIENCE_CASE_STUDIES.value: ["case study", "reference", "experience", "past performance", "client reference", "testimonial"]
}

class RfpParserService:
    def __init__(self):
        self.max_file_size = 25 * 1024 * 1024 # 25MB

    def parse_file(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Validate, extract text and structure RFP questions from PDF or DOCX."""
        if not file_bytes or len(file_bytes) == 0:
            raise ValueError("Uploaded file is empty (0 bytes).")
            
        if len(file_bytes) > self.max_file_size:
            raise ValueError(f"File size exceeds maximum allowed limit of {self.max_file_size // (1024*1024)}MB.")

        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            raw_text, page_map = self._extract_pdf(file_bytes)
        elif ext in [".docx", ".doc"]:
            raw_text, page_map = self._extract_docx(file_bytes)
        elif ext in [".txt", ".md"]:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
            page_map = {1: raw_text}
        else:
            raise ValueError(f"Unsupported file format '{ext}'. Supported formats are PDF, DOCX, TXT.")

        if not raw_text.strip():
            raise ValueError("Could not extract any readable text from the document.")

        questions = self._extract_questions(raw_text, page_map)
        deadline = self._detect_deadline(raw_text)
        
        return {
            "filename": filename,
            "raw_text_length": len(raw_text),
            "total_questions_detected": len(questions),
            "detected_deadline": deadline,
            "questions": questions
        }

    def _extract_pdf(self, file_bytes: bytes) -> tuple[str, Dict[int, str]]:
        page_map = {}
        all_text = []
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for i, page in enumerate(reader.pages, 1):
                txt = page.extract_text() or ""
                page_map[i] = txt
                all_text.append(txt)
        except Exception as e:
            raise ValueError(f"Corrupted or invalid PDF file: {e}")
            
        return "\n".join(all_text), page_map

    def _extract_docx(self, file_bytes: bytes) -> tuple[str, Dict[int, str]]:
        try:
            doc = Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            
            # Also extract tables
            table_cells = []
            for t in doc.tables:
                for row in t.rows:
                    row_txt = [c.text.strip() for c in row.cells if c.text.strip()]
                    if row_txt:
                        table_cells.append(" | ".join(row_txt))
                        
            all_text = "\n".join(paragraphs + table_cells)
            return all_text, {1: all_text}
        except Exception as e:
            raise ValueError(f"Corrupted or invalid DOCX document: {e}")

    def _classify_category(self, text: str) -> str:
        text_lower = text.lower()
        for cat, keywords in CATEGORY_KEYWORDS.items():
            if any(re.search(rf"\b{k}\b", text_lower) for k in keywords):
                return cat
        return QuestionCategory.OTHER.value

    def _detect_deadline(self, text: str) -> Optional[str]:
        match = re.search(r"(?:submission deadline|due date|respond by|closing date)[\s:]+([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{4}-\d{2}-\d{2})", text, re.IGNORECASE)
        return match.group(1) if match else "14 business days from issuance"

    def _extract_questions(self, text: str, page_map: Dict[int, str]) -> List[Dict[str, Any]]:
        """Identify discrete question line-items using pattern matching."""
        questions = []
        lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
        
        current_section = "General Requirements"
        q_counter = 1
        
        # Regex patterns for numbered questions (e.g., "1.1", "Q1.", "2. Describe...", "Req-14:")
        pattern = re.compile(r"^(?:(?:section|part|module)\s+[\dIVX]+[:.]?\s*)?(?:[qQ]?\d+[\.\-\)]|[A-Z]\.\d+|req-?\d+[:\.]?)\s+(.+)", re.IGNORECASE)
        section_pattern = re.compile(r"^(?:section|part|module)\s+[\dIVX]+[:.]?\s*(.+)", re.IGNORECASE)

        for line in lines:
            sec_match = section_pattern.match(line)
            if sec_match and len(line) < 80:
                current_section = sec_match.group(1).strip()
                continue
                
            q_match = pattern.match(line)
            is_question = bool(q_match) or line.endswith("?") or ("describe " in line.lower() and len(line) > 30) or ("provide " in line.lower() and len(line) > 30)
            
            if is_question and len(line) >= 15:
                q_text = line
                # Determine page reference
                page_ref = 1
                for p_num, p_txt in page_map.items():
                    if line[:30] in p_txt:
                        page_ref = p_num
                        break
                        
                cat = self._classify_category(q_text)
                is_mandatory = not ("optional" in q_text.lower() or "nice to have" in q_text.lower())
                
                # Check for evidence requests
                evidence = None
                if any(w in q_text.lower() for w in ["attach", "provide certificate", "evidence", "diagram", "policy"]):
                    evidence = "Mandatory supporting documentation / audit attestation required"

                questions.append({
                    "question_index": q_counter,
                    "section": current_section,
                    "question_text": q_text,
                    "category": cat,
                    "is_mandatory": is_mandatory,
                    "required_evidence": evidence,
                    "evaluation_criteria": "Evaluated on completeness, verified architectural controls, and compliance alignment.",
                    "page_reference": page_ref
                })
                q_counter += 1

        # If strict numbered lines were sparse, fallback to sentence-based question extraction
        if len(questions) < 2:
            candidate_sentences = re.split(r"(?<=[.?!])\s+", text)
            for s in candidate_sentences:
                s = s.strip()
                if (s.endswith("?") or s.lower().startswith(("describe", "detail", "explain", "provide", "what is", "how do"))) and len(s) > 25:
                    cat = self._classify_category(s)
                    questions.append({
                        "question_index": q_counter,
                        "section": current_section,
                        "question_text": s,
                        "category": cat,
                        "is_mandatory": True,
                        "required_evidence": None,
                        "evaluation_criteria": "Evaluated on architectural fidelity and compliance standards.",
                        "page_reference": 1
                    })
                    q_counter += 1
                    if q_counter > 25: # Cap at reasonable sample
                        break

        return questions

rfp_parser_service = RfpParserService()
