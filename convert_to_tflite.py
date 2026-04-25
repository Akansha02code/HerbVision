import tensorflow as tf
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "backend" / "models"
MODEL_PATH = MODELS_DIR / "plant_identification_final.h5"
TFLITE_PATH = MODELS_DIR / "model.tflite"

if not MODEL_PATH.exists():
    # Try the other candidate
    MODEL_PATH = MODELS_DIR / "plant_health_model.h5"

if MODEL_PATH.exists():
    print(f"Loading model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    print("Converting to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    # Optimization for size
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    
    print(f"Saving TFLite model to {TFLITE_PATH}...")
    with open(TFLITE_PATH, "wb") as f:
        f.write(tflite_model)
    print("Conversion complete! This model is now production-ready.")
else:
    print("No .h5 model found to convert.")
