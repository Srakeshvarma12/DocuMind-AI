import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

try:
    print("Available Gemini Models:")
    models = list(genai.list_models())
    if not models:
        print("No models found.")
    for m in models:
        print(f"- {m.name} (Methods: {m.supported_generation_methods})")
except Exception as e:
    print(f"Error: {e}")
