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

def inspect_logits():
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    with open(CLASS_MAP_PATH, "r") as f:
        class_map = json.load(f)
    inv_map = {v: k for k, v in class_map.items()}
    
    print("Class Map in JSON:", class_map)
    
    for cls in sorted(os.listdir(TRAIN_DIR)):
        cls_dir = TRAIN_DIR / cls
        images = list(cls_dir.glob("*.jpg"))
        if not images: continue
        img_path = images[0]
        
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        arr = np.array(img).astype(np.float32)
        p = np.expand_dims(arr, axis=0) # Raw 0-255 because of rescaling layer
        
        preds = model.predict(p, verbose=0)[0]
        top_idx = np.argmax(preds)
        
        print(f"\nImage from folder: {cls}")
        print(f"Probabilities: {preds}")
        print(f"Argmax Index: {top_idx} -> Maps to: {inv_map[top_idx]}")

if __name__ == "__main__":
    inspect_logits()
