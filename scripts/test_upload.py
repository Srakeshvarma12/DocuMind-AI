import requests
import time
import os

BASE_URL = "http://localhost:8000/api"
MOCK_TOKEN = "mock-token-123"
FILE_PATH = r"C:\Users\srvar\Downloads\Vendor_NDA_Stripe_2024.pdf"

headers = {
    "Authorization": f"Bearer {MOCK_TOKEN}"
}

def test_flow():
    if not os.path.exists(FILE_PATH):
        print(f"ERROR: File not found at {FILE_PATH}")
        return

    print(f"--- 1. Uploading {os.path.basename(FILE_PATH)} ---")
    with open(FILE_PATH, 'rb') as f:
        files = {'file': f}
        data = {'title': os.path.basename(FILE_PATH)}
        res = requests.post(f"{BASE_URL}/documents/upload/", headers=headers, files=files, data=data)
    
    if res.status_code != 201:
        print(f"FAILED: Status {res.status_code}")
        print(res.text)
        return

    doc_id = res.json()['data']['id']
    print(f"SUCCESS: Document ID {doc_id}")

    print("\n--- 2. Waiting for processing ---")
    start_time = time.time()
    while time.time() - start_time < 300: # 5 min timeout
        status_res = requests.get(f"{BASE_URL}/documents/{doc_id}/status/", headers=headers)
        status = status_res.json()['data']['status']
        print(f"Current Status: {status}")
        
        if status == 'ready':
            print("SUCCESS: Processing complete!")
            break
        if status == 'failed':
            print(f"FAILED: {status_res.json()['data'].get('error_message', 'Unknown error')}")
            return
        
        time.sleep(5)
    else:
        print("FAILED: Timeout waiting for processing")
        return

    print("\n--- 3. Verifying Results ---")
    summary_res = requests.get(f"{BASE_URL}/documents/{doc_id}/summary/", headers=headers)
    if summary_res.status_code == 200:
        data = summary_res.json()['data']
        print(f"Title: {data['title']}")
        print(f"Pages: {data['page_count']}")
        print(f"Words: {data['word_count']}")
        print("\nSummary Preview:")
        print("-" * 20)
        print(data['summary'][:500] + "...")
        print("-" * 20)
    else:
        print("FAILED: Could not retrieve summary")

if __name__ == "__main__":
    test_flow()
