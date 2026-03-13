import cloudinary.utils
import os
import requests
import time
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

public_id = "documind/documents/Vendor_NDA_Stripe_2024_f50bc12c.pdf" # Correct ID with .pdf

def test_basic_auth():
    # Get the original file URL from the DB or similar
    url = "https://res.cloudinary.com/dppri4hhz/raw/upload/v1773163525/documind/documents/Vendor_NDA_Stripe_2024_f50bc12c.pdf"
    print(f"Testing Basic Auth for: {url}")
    
    api_key = os.environ.get('CLOUDINARY_API_KEY')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET')
    
    res = requests.get(url, auth=(api_key, api_secret))
    print(f"Status: {res.status_code}")
    if res.status_code != 200:
        print(f"Error: {res.text}")
    else:
        print("SUCCESS: File downloaded with Basic Auth!")

if __name__ == "__main__":
    test_basic_auth()
