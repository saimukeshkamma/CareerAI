import os
import uuid
from fastapi import UploadFile, HTTPException
from ..config import settings

os.makedirs(settings.STORAGE_DIR, exist_ok=True)

class StorageService:
    @staticmethod
    async def save_resume_file(upload_file: UploadFile) -> tuple[str, str, int]:
        # Validate extension
        filename = upload_file.filename or "resume.pdf"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".pdf", ".docx", ".txt"]:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a PDF, DOCX, or TXT file."
            )
        
        unique_filename = f"{uuid.uuid4()}{ext}"
        target_path = os.path.join(settings.STORAGE_DIR, unique_filename)
        
        # Read content and enforce size limit
        content = await upload_file.read()
        file_size = len(content)
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        
        if file_size > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )
        
        with open(target_path, "wb") as f:
            f.write(content)
            
        return target_path, unique_filename, file_size

    @staticmethod
    def delete_file(file_path: str):
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
