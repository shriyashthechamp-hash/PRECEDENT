import os
from app.config import settings
from groq import Groq

def test_groq_live():
    key = settings.GROQ_API_KEY
    if not key:
        print("ERROR: GROQ_API_KEY is not set in settings!")
        return False
        
    masked = key[:6] + "..." + key[-4:] if len(key) > 10 else "***"
    print(f"Loaded GROQ_API_KEY: {masked} (length {len(key)})")
    print(f"Primary configured model: {settings.GROQ_MODEL}")
    print(f"Fallback model: {settings.GROQ_FALLBACK_MODEL}")
    
    client = Groq(api_key=key)
    
    # 1. List or check available models
    try:
        models = client.models.list()
        model_ids = [m.id for m in models.data]
        print(f"Successfully connected to Groq API. Total models available: {len(model_ids)}")
        print(f"Is '{settings.GROQ_MODEL}' in available models? {settings.GROQ_MODEL in model_ids}")
        print(f"Is '{settings.GROQ_FALLBACK_MODEL}' in available models? {settings.GROQ_FALLBACK_MODEL in model_ids}")
    except Exception as e:
        print(f"Failed to list models: {e}")
        return False
        
    # 2. Test structured JSON completion
    print("Testing live structured completion...")
    try:
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a proposal engine. Return only JSON conforming to {\"status\": \"ok\", \"verified\": true}"},
                {"role": "user", "content": "Ping test"}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = completion.choices[0].message.content
        print(f"Live response received successfully: {content}")
        return True
    except Exception as e:
        print(f"Structured completion failed with {settings.GROQ_MODEL}: {e}")
        # Try fallback model if primary has issues
        print(f"Testing with fallback model {settings.GROQ_FALLBACK_MODEL}...")
        try:
            completion = client.chat.completions.create(
                model=settings.GROQ_FALLBACK_MODEL,
                messages=[
                    {"role": "system", "content": "Return JSON: {\"status\": \"ok\"}"},
                    {"role": "user", "content": "Ping test"}
                ],
                response_format={"type": "json_object"}
            )
            print(f"Fallback model succeeded: {completion.choices[0].message.content}")
            return True
        except Exception as e2:
            print(f"Fallback also failed: {e2}")
            return False

if __name__ == "__main__":
    success = test_groq_live()
    exit(0 if success else 1)

