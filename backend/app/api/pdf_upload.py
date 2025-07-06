from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import aiofiles
import os
import uuid
from datetime import datetime
from typing import Optional
import PyPDF2
import io
from app.api.auth import get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/pdf", tags=["pdf"])

# Ensure upload directory exists
UPLOAD_DIR = "app/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a PDF file and extract its content"""
    
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Validate file size (max 10MB)
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 10MB")
    
    try:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Extract text content from PDF
        extracted_content = await extract_pdf_content(content)
        
        # Return response
        return {
            "success": True,
            "file_id": file_id,
            "filename": filename,
            "original_name": file.filename,
            "file_size": len(content),
            "uploaded_at": datetime.utcnow().isoformat(),
            "extracted_content": extracted_content,
            "file_url": f"/static/uploads/{filename}"
        }
        
    except Exception as e:
        # Clean up file if it was saved
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@router.get("/extract/{file_id}")
async def extract_content(
    file_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Extract content from an uploaded PDF file"""
    
    try:
        # Find the file in upload directory
        for filename in os.listdir(UPLOAD_DIR):
            if filename.startswith(file_id):
                file_path = os.path.join(UPLOAD_DIR, filename)
                break
        else:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Read and extract content
        async with aiofiles.open(file_path, 'rb') as f:
            content = await f.read()
        
        extracted_content = await extract_pdf_content(content)
        
        return {
            "success": True,
            "file_id": file_id,
            "extracted_content": extracted_content
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract content: {str(e)}")

@router.delete("/{file_id}")
async def delete_pdf(
    file_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an uploaded PDF file"""
    
    try:
        # Find and delete the file
        for filename in os.listdir(UPLOAD_DIR):
            if filename.startswith(file_id):
                file_path = os.path.join(UPLOAD_DIR, filename)
                os.remove(file_path)
                return {"success": True, "message": "File deleted successfully"}
        
        raise HTTPException(status_code=404, detail="File not found")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

async def extract_pdf_content(pdf_content: bytes) -> str:
    """Extract text content from PDF bytes"""
    try:
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        
        # Extract text from all pages
        text_content = []
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_content.append(page.extract_text())
        
        # Combine all text
        full_text = "\n\n".join(text_content)
        
        # Clean up the text
        cleaned_text = clean_extracted_text(full_text)
        
        return cleaned_text
        
    except Exception as e:
        raise Exception(f"Failed to extract PDF content: {str(e)}")

def clean_extracted_text(text: str) -> str:
    """Clean and format extracted text"""
    if not text:
        return "No text content found in PDF"
    
    # Remove excessive whitespace
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if line:  # Only keep non-empty lines
            cleaned_lines.append(line)
    
    # Join lines with proper spacing
    cleaned_text = '\n'.join(cleaned_lines)
    
    # Add some basic formatting
    formatted_text = f"""# Extracted Content from PDF

## Raw Text Content:
{cleaned_text}

## Suggested Structure:
Based on the extracted content, you can create:

### Lessons:
- Break down the content into logical sections
- Create interactive elements
- Add multimedia content

### Quiz Questions:
- Generate questions from key concepts
- Create multiple choice questions
- Add explanations for answers

### Course Modules:
- Organize content by topics
- Create learning objectives
- Structure progressive learning paths

---
*This content was automatically extracted from the uploaded PDF file.*
"""
    
    return formatted_text 