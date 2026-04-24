import tensorflow as tf
import json
from pathlib import Path

BASE_DIR = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend")
TRAIN_DIR = BASE_DIR / "dataset_top5" / "train"

if not TRAIN_DIR.exists():
    print(f"Train directory not found at {TRAIN_DIR}")
    exit(1)

# Mimic the image data generator from the training script
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator()
train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(224, 224),
    batch_size=16,
    class_mode='categorical'
)

print("Actual Class Indices from Directory:")
print(train_generator.class_indices)

# Update the JSON files with the REAL detected mapping
with open(BASE_DIR / "models" / "class_map.json", "w") as f:
    json.dump(train_generator.class_indices, f)
with open(BASE_DIR / "models" / "class_map_top20.json", "w") as f:
    json.dump(train_generator.class_indices, f)
