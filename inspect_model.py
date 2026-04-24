import tensorflow as tf
import os
from pathlib import Path

BASE_DIR = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend")
MODEL_PATH = BASE_DIR / "models" / "plant_health_model.h5"

if not MODEL_PATH.exists():
    print(f"Model not found at {MODEL_PATH}")
    exit(1)

try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("Model loaded successfully.")
    print("Layer names:", [l.name for l in model.layers])
    
    # Check if there is a rescaling layer
    has_rescaling = any(isinstance(l, tf.keras.layers.Rescaling) or "rescaling" in l.name for l in model.layers)
    print(f"Has rescaling layer: {has_rescaling}")
    
    # Check class indices from training (if possible)
    # Note: h5 models don't usually store class_indices in a standard way unless saved as an attribute
    
except Exception as e:
    print(f"Error inspecting model: {e}")
