import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(r'C:\Users\srvar\OneDrive\Documents\DocuMind-AI\backend')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'documind.settings')
import django
django.setup()

from apps.documents.utils.extraction import extract_text

# Let's try to extract from the last uploaded file if possible
# Or just a sample file from Downloads
sample_file = r'C:\Users\srvar\Downloads\Vendor_NDA_Stripe_2024.pdf'

if os.path.exists(sample_file):
    print(f"Testing extraction for: {sample_file}")
    text = extract_text(sample_file, 'pdf')
    print(f"Extracted text length: {len(text)}")
    print(f"Preview: {text[:200]}")
else:
    print(f"Sample file not found: {sample_file}")
