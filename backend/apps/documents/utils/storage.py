import cloudinary
import cloudinary.uploader
import os

def upload_document(file_path, public_id_prefix="documind"):
    """
    Upload a file to Cloudinary.
    """
    try:
        # Configuration is already handled by settings.py/Cloudinary app
        # but we can explicitly set it here if needed for direct uploader calls
        result = cloudinary.uploader.upload(
            file_path, 
            resource_type="raw",
            folder="documind/",
            public_id=public_id_prefix
        )
        return {
            'url': result['secure_url'],
            'public_id': result['public_id']
        }
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")
