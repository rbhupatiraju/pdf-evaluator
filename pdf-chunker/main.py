from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
import base64
import random
from io import BytesIO
from typing import List, Dict, Any
from pathlib import Path

file_path = "/Users/ragmeister/Desktop/gsco-12-31-2023.pdf"

# Define request models
class PageRequest(BaseModel):
    page_number: int

class DocumentCheckRequest(BaseModel):
    document_id: str

app = FastAPI(
    title="PDF Page Extractor",
    description="API to extract specific pages from a PDF file and return them as base64 encoded strings",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router for API endpoints
api_router = APIRouter(prefix="/api")

# Store document paths by ID
document_paths = {
    "xyz": "/Users/ragmeister/Desktop/gsco-12-31-2023.pdf",
    # Add more document IDs and paths as needed
}

@api_router.post("/checks",
    summary="Get document checks",
    description="Returns a list of checks with random pass/fail statuses",
    response_description="List of checks with their statuses"
)
async def get_checks(request: DocumentCheckRequest):
    """
    Get document checks with random pass/fail statuses.
    
    - **request**: Request payload containing document_id
    - **Returns**: JSON containing checks organized by sections
    """
    try:
        # Define checks with random statuses
        checks = {
            "Section 1": [
                {
                    "text": "PDF has proper page numbering.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Verify that all pages are numbered correctly and consistently throughout the document.",
                    "page_number": 1
                },
                {
                    "text": "Table of contents is accurate.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Ensure the table of contents matches the actual document structure and page numbers.",
                    "page_number": 2
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                },
                {
                    "text": "Headers and footers are consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Check that headers and footers maintain consistent formatting and content across all pages.",
                    "page_number": 3
                }
            ],
            "Section 2": [
                {
                    "text": "Document formatting is consistent.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Verify consistent use of fonts, spacing, and alignment throughout the document.",
                    "page_number": 3
                },
                {
                    "text": "Images and figures are properly labeled.",
                    "status": "pass" if random.random() > 0.5 else "fail",
                    "details": "Ensure all images and figures have appropriate captions and references.",
                    "page_number": 3
                }
            ]
        }
        
        return JSONResponse(checks)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/total-pages",
    summary="Get total number of pages",
    description="Returns the total number of pages in the PDF file",
    response_description="The total number of pages in the PDF"
)
async def get_total_pages():
    """
    Get the total number of pages in the PDF file.
    
    - **Returns**: JSON containing the total number of pages
    """
    try:
        # Check if file exists
        if not Path(file_path).exists():
            raise HTTPException(
                status_code=400,
                detail=f"File not found at path: {file_path}"
            )
        
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(file_path)
        
        return JSONResponse({
            "total_pages": len(pdf_reader.pages)
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/extract-page", 
    summary="Extract a specific page from the PDF",
    description="Extracts a single page from the PDF file and returns it as a base64 encoded string",
    response_description="The base64 encoded content of the requested page"
)
async def extract_page(request: PageRequest):
    """
    Extract a specific page from the PDF file.
    
    - **request**: Request payload containing page_number
    - **Returns**: JSON containing the page number and base64 encoded content
    """
    try:
        # Check if file exists
        if not Path(file_path).exists():
            raise HTTPException(
                status_code=400,
                detail=f"File not found at path: {file_path}"
            )
        
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(file_path)
        
        # Check if page number is valid
        if request.page_number < 1 or request.page_number > len(pdf_reader.pages):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid page number. PDF has {len(pdf_reader.pages)} pages."
            )
        
        # Get the specific page
        page = pdf_reader.pages[request.page_number - 1]
        
        # Create a new PDF with just this page
        output = PyPDF2.PdfWriter()
        output.add_page(page)
        
        # Convert to bytes
        output_bytes = BytesIO()
        output.write(output_bytes)
        output_bytes.seek(0)
        
        # Convert to base64
        base64_encoded = base64.b64encode(output_bytes.getvalue()).decode('utf-8')
        
        return JSONResponse({
            "page_number": request.page_number,
            "base64_content": base64_encoded
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/", 
    summary="API Status",
    description="Check if the API is running"
)
async def root():
    """
    Root endpoint to check if the API is running.
    
    - **Returns**: A simple message indicating the API is running
    """
    return {"message": "PDF Page Extractor API is running. Use POST /api/extract-page to extract a specific page."}

# Include the API router
app.include_router(api_router) 