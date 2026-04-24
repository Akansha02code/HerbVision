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

# Clean up
for f in MODELS_DIR.glob("*.h5"): f.unlink()

BATCH_SIZE = 32 # Increased for stability
IMG_SIZE = (224, 224)

print("Preparing advanced data generators...")
# Much stronger augmentation to fix the 'confusion'
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rotation_range=40,
    width_shift_range=0.3,
    height_shift_range=0.3,
    shear_range=0.3,
    zoom_range=0.3,
    horizontal_flip=True,
    brightness_range=[0.7, 1.3],
    fill_mode='nearest'
)

# Test generator should NOT vary
test_datagen = tf.keras.preprocessing.image.ImageDataGenerator()

train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

test_generator = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

class_indices = train_generator.class_indices
print("Final Class Mapping:", class_indices)
with open(MODELS_DIR / "class_map.json", "w") as f:
    json.dump(class_indices, f)

# Build a more robust model with Label Smoothing
base_model = tf.keras.applications.EfficientNetB0(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet',
    pooling='avg'
)

inputs = tf.keras.Input(shape=(224, 224, 3))
x = tf.keras.layers.Rescaling(1.0, name="rescaling")(inputs) # EfficientNet expects 0-255
x = base_model(x, training=True) # Set training=True to keep BN updated
x = tf.keras.layers.Dense(256, activation='relu')(x)
x = tf.keras.layers.Dropout(0.5)(x)
outputs = tf.keras.layers.Dense(len(class_indices), activation='softmax')(x)

model = tf.keras.Model(inputs, outputs)

# Training Phase 1: Warming up
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

print("Phase 1: Deep Feature Warmup...")
model.fit(train_generator, epochs=15, validation_data=test_generator)

# Training Phase 2: Fine-tuning all layers
base_model.trainable = True
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

print("Phase 2: Global Fine-Tuning...")
model.fit(train_generator, epochs=10, validation_data=test_generator)

# Save
model.save(MODELS_DIR / "plant_health_model.h5")
print("RETRAINING COMPLETE!")
