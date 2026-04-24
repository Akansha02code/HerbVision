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

def test_preprocessing_modes():
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    with open(CLASS_MAP_PATH, "r") as f:
        class_map = json.load(f)
    inv_map = {v: k for k, v in class_map.items()}
    
    # Test on one image from each class
    for cls in sorted(os.listdir(TRAIN_DIR)):
        cls_dir = TRAIN_DIR / cls
        img_path = next(cls_dir.glob("*.jpg"))
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        arr_raw = np.array(img).astype(np.float32)
        
        results = []
        # Mode 1: Raw [0, 255]
        p1 = np.expand_dims(arr_raw, axis=0)
        res1 = model.predict(p1, verbose=0)
        idx1 = np.argmax(res1[0])
        results.append(f"Raw: {inv_map[idx1]} ({res1[0][idx1]:.2f})")
        
        # Mode 2: [0, 1]
        p2 = np.expand_dims(arr_raw / 255.0, axis=0)
        res2 = model.predict(p2, verbose=0)
        idx2 = np.argmax(res2[0])
        results.append(f"0-1: {inv_map[idx2]} ({res2[0][idx2]:.2f})")
        
        print(f"Target: {cls} | {' | '.join(results)}")

if __name__ == "__main__":
    test_preprocessing_modes()
