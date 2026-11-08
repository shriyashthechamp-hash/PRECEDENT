import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.proposal import Proposal, RfpQuestion, ProposalStatus
from app.models.client import Client, Sector
from app.services.rfp_parser import rfp_parser_service

router = APIRouter(prefix="/rfp", tags=["RFP Ingestion & Workspace"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/ingest")
async def ingest_rfp_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    rfp_reference: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    sector_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Ingests an RFP document (PDF or DOCX), parses sections, extracts line-item requirements,
    and establishes a structured proposal workspace.
    """
    filename = file.filename or "uploaded_rfp.pdf"
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed extensions are: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Uploaded file exceeds maximum permitted size of 25MB (received {len(content) / (1024*1024):.1f}MB)."
            )
        parsed_data = rfp_parser_service.parse_file(content, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected parsing error: {str(e)}")

    # Proposal Title
    doc_title = title or os.path.splitext(file.filename or "Proposal")[0].replace("_", " ").title() + " Proposal"
    
    proposal = Proposal(
        title=doc_title,
        rfp_reference=rfp_reference or parsed_data.get("filename"),
        client_id=client_id,
        sector_id=sector_id,
        status=ProposalStatus.DRAFT.value,
        deadline=parsed_data.get("detected_deadline"),
        source_file=file.filename,
        total_questions=parsed_data["total_questions_detected"],
        reviewed_questions=0
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    # Insert parsed questions
    for q in parsed_data["questions"]:
        question_obj = RfpQuestion(
            proposal_id=proposal.id,
            question_index=q["question_index"],
            section=q["section"],
            question_text=q["question_text"],
            category=q["category"],
            is_mandatory=q["is_mandatory"],
            required_evidence=q["required_evidence"],
            evaluation_criteria=q["evaluation_criteria"],
            page_reference=q.get("page_reference", 1)
        )
        db.add(question_obj)

    db.commit()
    
    return {
        "status": "ingested_successfully",
        "proposal_id": proposal.id,
        "title": proposal.title,
        "total_questions": len(parsed_data["questions"]),
        "detected_deadline": proposal.deadline,
        "sample_questions": parsed_data["questions"][:3]
    }

