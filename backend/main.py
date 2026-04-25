import json
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq
import os
try:
    from .model import load_class_map, load_model, predict_from_image
except (ImportError, ValueError):
    from model import load_class_map, load_model, predict_from_image
import random
from dotenv import load_dotenv

load_dotenv()
# Using Groq for lightning-fast inference
key = os.environ.get("GROQ_API_KEY", "").strip()
groq_client = Groq(api_key=key)
# Llama 3.3 is the latest state-of-the-art model on Groq
GROQ_MODEL = "llama-3.3-70b-versatile"

BASE_DIR = Path(__file__).resolve().parent
KB_PATH = BASE_DIR / "knowledge_base.json"

app = FastAPI(title="HerbVision Inference API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://herb-vision.vercel.app",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load global resources
plant_model = load_model()
class_map = load_class_map()
with open(KB_PATH, "r", encoding="utf-8") as f:
    knowledge_base = json.load(f)

# --- MODELS ---

class PredictResponse(BaseModel):
    plant_name: str
    common_name: str
    confidence: float
    medicinal_uses: list
    care: dict
    care_suggestion: str

class CarePlanRequest(BaseModel):
    plant: str
    location: str
    soil: str
    sunlight: str
    environment: str

class ChatRequest(BaseModel):
    message: str
    history: list = []

# --- UTILS ---

def enhance_care(plant: str, kb: dict):
    plant_data = kb.get(plant) or kb.get(plant.title())
    if plant_data is None:
        return {
            "medicinal_uses": ["No data available"],
            "base_care": {
                "water": "Moderate",
                "sunlight": "Bright indirect sun",
                "soil": "Well-draining"
            },
            "care_suggestion": "Use general care: moderate water, full/partial sun, inspect plant closely."
        }
    
    return {
        "medicinal_uses": plant_data.get("medicinal_uses", []),
        "base_care": plant_data.get("base_care", plant_data.get("care", {})),
        "ideal_conditions": plant_data.get("ideal_conditions", {}),
        "ideal_ranges": plant_data.get("ideal_ranges", {"temperature": [20, 30], "humidity": [50, 70]}),
        "rules": plant_data.get("rules", {}),
    }

def get_climate(location: str):
    climate_map = {
        "mumbai": "tropical",
        "delhi": "subtropical",
        "bangalore": "tropical",
        "shimla": "temperate",
        "chennai": "tropical",
        "kolkata": "tropical",
        "pune": "subtropical",
        "hyderabad": "subtropical",
        "jaipur": "arid",
        "jodhpur": "arid",
    }
    return climate_map.get(location.lower(), "subtropical")

import requests

def get_real_weather(location: str, climate: str):
    try:
        # Use wttr.in for free, no-key weather data
        url = f"https://wttr.in/{location}?format=j1"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            # Extract current temp and humidity
            current = data['current_condition'][0]
            temp = int(current['temp_C'])
            humidity = int(current['humidity'])
            return {
                "temperature": temp,
                "humidity": humidity,
                "rainfall": current.get('weatherDesc', [{'value': 'Moderate'}])[0]['value']
            }
    except Exception as e:
        print(f"Weather API Error: {e}")
    
    # Fallback simulation if API fails
    base_temps = {
        "tropical": (25, 35),
        "subtropical": (20, 32),
        "arid": (30, 45),
        "temperate": (5, 20)
    }
    base_humidity = {
        "tropical": (60, 90),
        "subtropical": (40, 70),
        "arid": (10, 30),
        "temperate": (40, 60)
    }
    t_min, t_max = base_temps.get(climate, (20, 30))
    h_min, h_max = base_humidity.get(climate, (40, 60))
    return {"temperature": random.randint(t_min, t_max), "humidity": random.randint(h_min, h_max), "rainfall": "Moderate"}

# --- ENDPOINTS ---

@app.get("/api/health")
def health():
    return {"message": "HerbalAI API is running", "model_loaded": plant_model is not None}

@app.post("/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image upload.")

    prediction = predict_from_image(plant_model, class_map, image_bytes)
    plant_name = prediction["plant_name"]
    confidence = prediction["confidence"]

    if confidence < 0.45:
        return {
            "plant_name": "Unknown",
            "common_name": "Unknown",
            "confidence": confidence,
            "medicinal_uses": ["Could not identify with high certainty."],
            "care": {"water": "Varies", "sunlight": "Varies", "soil": "General"},
            "care_suggestion": "Try a clearer leaf photo."
        }

    kb_data = enhance_care(plant_name, knowledge_base)
    return {
        "plant_name": plant_name,
        "common_name": plant_name,
        "confidence": confidence,
        "medicinal_uses": kb_data["medicinal_uses"],
        "care": kb_data["base_care"],
        "care_suggestion": "Based on standard plant data."
    }

@app.post("/care-plan")
async def get_care_plan(req: CarePlanRequest):
    plant_info = enhance_care(req.plant, knowledge_base)
    if not plant_info.get("ideal_conditions"):
        return {
            "plant": req.plant,
            "location": req.location,
            "analysis": "Generic care plan issued.",
            "recommendations": ["Ensure moderate water.", "Provide adequate sunlight."],
            "climate": "Unknown",
            "growth_score": 50,
            "growth_category": "Moderate",
            "weather": {"temperature": "25\u00b0C", "humidity": "55%", "rainfall": "None"},
            "risks": ["Specific growth metrics unavailable for this plant."],
            "final_advice": "Maintain standard care: moderate water and partial sunlight.",
            "base_care": {"water": "Moderate", "sunlight": "Partial", "soil": "Standard Organic"}
        }

    climate = get_climate(req.location)
    weather = get_real_weather(req.location, climate)
    ideal = plant_info["ideal_conditions"]
    ranges = plant_info["ideal_ranges"]
    rules = plant_info["rules"]
    
    score = 0
    recommendations = []
    risks = []
    
    # Growth Score Calculation
    # 1. Temperature (30 pts)
    if ranges["temperature"][0] <= weather["temperature"] <= ranges["temperature"][1]:
        score += 30
    elif weather["temperature"] > ranges["temperature"][1]:
        score += 15
        risks.append(f"High temperature ({weather['temperature']}\u00b0C) exceeds ideal range.")
        recommendations.append("Increase watering frequency due to high heat.")
    else:
        score += 10
        risks.append(f"Low temperature ({weather['temperature']}\u00b0C) may slow growth.")
    
    # 2. Humidity (25 pts)
    if ranges["humidity"][0] <= weather["humidity"] <= ranges["humidity"][1]:
        score += 25
    elif weather["humidity"] > ranges["humidity"][1]:
        score += 10
        risks.append("High humidity increases risk of fungal infection.")
        recommendations.append("Ensure good air circulation to prevent mold.")
    else:
        score += 15
        risks.append("Low humidity may cause leaf tip browning.")
    
    # 3. Soil (20 pts)
    user_soil = req.soil.lower()
    ideal_soils = [s.lower() for s in ideal.get("soil", [])]
    if any(s in user_soil for s in ideal_soils):
        score += 20
    else:
        score += 5
        recommendations.append(rules.get("wrong_soil", f"Consider switching to {ideal['soil'][0]} soil for better nutrients."))
        risks.append("Current soil type may limit nutrient absorption.")

    # 4. Sunlight (25 pts)
    user_sun = req.sunlight.lower()
    ideal_sun = [s.lower() for s in ideal.get("sunlight", [])]
    if "full" in ideal_sun:
        if "full" in user_sun: score += 25
        elif "partial" in user_sun: score += 15
        else: 
            score += 5
            recommendations.append(rules.get("low_sunlight", "Move to a sunnier spot."))
    elif "partial" in ideal_sun:
        if "partial" in user_sun: score += 25
        elif "full" in user_sun: 
            score += 15
            recommendations.append("Provide some afternoon shade to prevent leaf burn.")
        else: score += 10

    # 5. Environment Check (Penalty for mismatch)
    user_env = req.environment.lower()
    ideal_env = [e.lower() for e in ideal.get("environment", ["outdoor", "indoor"])]
    if user_env not in ideal_env:
        # Significant penalty for plants like Neem/Amla that need outdoors
        score -= 40
        risks.append(f"Growing {req.plant} {user_env} is highly challenging.")
        recommendations.append(rules.get("indoor" if user_env == "indoor" else "outdoor", f"Consider moving {req.plant} to an {ideal_env[0]} environment."))
    
    # Ensure score stays within 0-100
    score = max(0, min(100, score))
    
    # Growth Category
    category = "Poor"
    if score >= 85: category = "Excellent Growth Rate"
    elif score >= 65: category = "Good Growth Potential"
    elif score >= 45: category = "Moderate Growth"

    # Final Advice
    advice = "Your plant has a high chance of thriving! Follow the tips below."
    if score < 45: advice = "Conditions are challenging. Significant adjustments needed for survival."
    elif score < 75: advice = "Plant will grow, but needs careful monitoring of environmental factors."

    # Environment logic
    if req.environment.lower() == "indoor":
        recommendations.append(rules.get("indoor", "Ensure proper ventilation and indirect sunlight."))
    else:
        recommendations.append(rules.get("outdoor", "Protect from extreme weather fluctuations."))

    return {
        "plant": req.plant,
        "location": req.location,
        "climate": climate,
        "weather": {
            "temperature": f"{weather['temperature']}\u00b0C",
            "humidity": f"{weather['humidity']}%",
            "rainfall": weather["rainfall"]
        },
        "growth_score": score,
        "growth_category": category,
        "analysis": f"Growth Score: {score}% - {category}",
        "recommendations": list(set(recommendations)), # Remove duplicates
        "risks": risks,
        "final_advice": advice,
        "base_care": plant_info["base_care"]
    }

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        system_context = """You are 'HerbVision Bot', a botanical and medicinal plant expert. 
        Provide scientifically accurate, well-structured advice. 
        ALWAYS use bullet points, bold headings, and short paragraphs for readability. 
        Avoid long blocks of text. Focus on:
        - Medicinal benefits
        - Growing conditions
        - Precautions & consult a professional reminder."""
        
        # Calling Groq for ultra-fast completions
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_context},
                {"role": "user", "content": req.message}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        
        return {"reply": completion.choices[0].message.content}
        
    except Exception as e:
        err_str = str(e)
        print(f"DEBUG Groq Chat Error: {err_str}")
        if "API key" in err_str:
            return {"reply": "Oops! Groq API key is missing or invalid. Check your .env file."}
        return {"reply": f"Groq AI currently unreachable: {err_str[:80]}..."}

# Serve the frontend dist folder - must be at the VERY end
dist_path = BASE_DIR.parent / "dist"
if dist_path.exists():
    app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    # Robust loading for both local and production
    app_module = "backend.main:app" if __package__ else "main:app"
    uvicorn.run(app_module, host="0.0.0.0", port=port, reload=False)
