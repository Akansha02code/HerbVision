import tensorflow as tf
import numpy as np
import json
import os
from pathlib import Path
from PIL import Image

BASE_DIR = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend")
MODEL_PATH = BASE_DIR / "models" / "plant_health_model.h5"
CLASS_MAP_PATH = BASE_DIR / "models" / "class_map.json"
TRAIN_DIR = BASE_DIR / "dataset_top5" / "train"

def test_model():
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    with open(CLASS_MAP_PATH, "r") as f:
        class_map = json.load(f)
    inv_map = {v: k for k, v in class_map.items()}
    
    layers = getattr(model, "layers", [])
    layer_names = [getattr(l, "name", "").lower() for l in layers]
    is_mobilenet = any("mobilenet" in name for name in layer_names)
    
    print(f"Testing Model: {'MobileNetV2' if is_mobilenet else 'Other'}")
    
    for cls in sorted(os.listdir(TRAIN_DIR)):
        cls_dir = TRAIN_DIR / cls
        images = list(cls_dir.glob("*.jpg"))
        if not images: continue
        img_path = images[0]
        
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        arr = np.array(img).astype(np.float32)
        
        if is_mobilenet:
            arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
        
        p = np.expand_dims(arr, axis=0)
        
        preds = model.predict(p, verbose=0)[0]
        idx = np.argmax(preds)
        pred_name = inv_map.get(idx, "Unknown")
        conf = preds[idx]
        
        print(f"True: {cls:10} | Predicted: {pred_name:10} ({conf:.2f})")

if __name__ == "__main__":
    test_model()
