import tensorflow as tf
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "plant_health_model_top20.h5"
TFLITE_PATH = MODELS_DIR / "model.tflite"

def convert():
    if not MODEL_PATH.exists():
        print(f"Model not found at {MODEL_PATH}")
        return

    print(f"Loading model from {MODEL_PATH}...")
    # Load the Keras model
    try:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    print("Converting to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimization for size and speed (optional but recommended for Render)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    tflite_model = converter.convert()

    print(f"Saving TFLite model to {TFLITE_PATH}...")
    with open(TFLITE_PATH, "wb") as f:
        f.write(tflite_model)
    
    print("Success!")

if __name__ == "__main__":
    convert()
