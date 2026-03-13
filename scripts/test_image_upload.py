import cloudinary.uploader
import cloudinary.utils
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load env
load_dotenv(Path(__file__).resolve().parent.parent / '.env')

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)

FILE_PATH = r"C:\Users\srvar\Downloads\Vendor_NDA_Stripe_2024.pdf"

def test_image_upload():
    print(f"Uploading {FILE_PATH} as 'image'...")
    result = cloudinary.uploader.upload(
        FILE_PATH,
        resource_type='image',
        folder='test/documents',
        format='pdf',
        access_mode='public'
    )
    
    url = result['secure_url']
    print(f"Uploaded URL: {url}")
    
    print("Testing download...")
    res = requests.get(url)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        print("SUCCESS: File is publicly accessible as 'image' type!")
    else:
        print(f"FAILED: {res.status_code}")
        print(res.text)

if __name__ == "__main__":
    test_image_upload()
