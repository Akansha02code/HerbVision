import tensorflow as tf
import numpy as np
import os
from pathlib import Path
from PIL import Image

BASE_DIR = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend")
MODEL_PATH = BASE_DIR / "models" / "plant_health_model.h5"
TRAIN_DIR = BASE_DIR / "dataset_top5" / "train"

def detect_actual_mapping():
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    
    mapping = {}
    for cls in sorted(os.listdir(TRAIN_DIR)):
        cls_dir = TRAIN_DIR / cls
        images = list(cls_dir.glob("*.jpg"))
        if not images: continue
        img_path = images[0]
        
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        arr = np.array(img).astype(np.float32)
        p = np.expand_dims(arr, axis=0)
        
        preds = model.predict(p, verbose=0)[0]
        idx = int(np.argmax(preds))
        mapping[cls] = idx
    
    print("REAL_MAPPING_START")
    print(mapping)
    print("REAL_MAPPING_END")

if __name__ == "__main__":
    detect_actual_mapping()
