import os
import json
import numpy as np
import tensorflow as tf
from pathlib import Path

# Paths
BASE_DIR = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend")
DATA_DIR = BASE_DIR / "dataset_top5"
TRAIN_DIR = DATA_DIR / "train"
TEST_DIR = DATA_DIR / "test"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)

# Explicitly define classes to avoid alphabetical/folder shift issues
CLASSES = ["Aloevera", "Betel", "Neem", "Papaya", "Tulsi"]
class_map = {cls: i for i, cls in enumerate(CLASSES)}

BATCH_SIZE = 32
IMG_SIZE = (224, 224)

print("Preparing Submission-Grade Data Generators...")
# Standard MobileNet preprocessing
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input
)

train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASSES # ENFORCE ORDER
)

test_generator = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASSES, # ENFORCE ORDER
    shuffle=False
)

print("Final Class Mapping:", class_map)
with open(MODELS_DIR / "class_map.json", "w") as f:
    json.dump(class_map, f)

# MobileNetV2 is much more stable for this scale of project
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet',
    pooling='avg'
)
base_model.trainable = True # Fine-tune from start for speed

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Dense(len(CLASSES), activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("Starting FINAL training phase...")
model.fit(
    train_generator,
    epochs=15,
    validation_data=test_generator
)

# Save
model.save(MODELS_DIR / "plant_identification_final.h5")
print("SUBMISSION MODEL READY!")
