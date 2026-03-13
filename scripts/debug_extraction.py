import os
import sys

# Add the backend directory to the path so we can import the utils
sys.path.append(r"C:\Users\srvar\OneDrive\Documents\DocuMind-AI\backend")

from apps.documents.utils.extraction import extract_text, get_doc_metadata

FILE_PATH = r"C:\Users\srvar\Downloads\Vendor_NDA_Stripe_2024.pdf"

if __name__ == "__main__":
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        sys.exit(1)
    
    print(f"Testing extraction for: {FILE_PATH}")
    
    text = extract_text(FILE_PATH, 'pdf')
    metadata = get_doc_metadata(FILE_PATH, 'pdf')
    
    print(f"Text length: {len(text)}")
    print(f"Metadata: {metadata}")
    
    if len(text) > 0:
        print("--- Text Preview ---")
        print(text[:500] + "...")
        print("--------------------")
    else:
        print("FAILED: No text extracted.")
