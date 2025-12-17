import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# --- NEW SDK IMPORTS ---
from google import genai
from google.genai import types

# 1. Load Environment Variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    # Fallback for hackathon speed if .env fails
    print("⚠️ WARNING: GEMINI_API_KEY not found in .env. Checking system vars...")

# 2. Initialize the New Client
# The new SDK automatically looks for 'GEMINI_API_KEY' or 'GOOGLE_API_KEY' env vars.
# If you named it GEMINI_API_KEY in .env, this works automatically.
client = genai.Client(api_key=API_KEY)

# 3. Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"status": "Aegis-X Brain is Online 🟢"}

@app.post("/analyze")
def analyze_email(request: EmailRequest):
    sanitized_text = request.text
    print(f"\n📨 RECEIVED: {sanitized_text[:50]}...")

    prompt_text = f"""
    You are a Cybersecurity Expert. Analyze this SANITIZED email for phishing.
    The text has redacted PII (e.g., {{EMAIL_ID}}). Do not flag redactions as suspicious.

    Analyze for:
    1. False Urgency
    2. Authority Mimicry
    3. Inconsistencies.

    Input Text:
    "{sanitized_text}"

    Return JSON ONLY:
    {{
        "is_threat": boolean,
        "risk_score": integer (0-100),
        "reason": "Short explanation."
    }}
    """

    try:
        # --- NEW SDK CALL ---
        response = client.models.generate_content(
            model='Gemini 2.5 flash-lite', # Or 'gemini-1.5-flash' if 2.0 isn't available to you yet
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json' 
            )
        )
        
        # FIX: Check if text is None before parsing
        raw_json = response.text
        
        if raw_json is None:
            print("⚠️ AI blocked the response or returned empty text.")
            # Return a "Safe" fallback to prevent the app from crashing
            return {"is_threat": False, "risk_score": 0, "reason": "AI could not process request."}

        # Now it is safe to parse because we know it's not None
        verdict = json.loads(raw_json)
        
        print(f"🤖 VERDICT: Threat={verdict.get('is_threat')}")
        return verdict

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)