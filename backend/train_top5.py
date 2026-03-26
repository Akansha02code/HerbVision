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

# Delete existing models to avoid conflicts
for file in MODELS_DIR.glob("*.h5"):
    file.unlink()
for file in MODELS_DIR.glob("*.json"):
    if file.name.startswith("class_map"):
        file.unlink()

BATCH_SIZE = 16
IMG_SIZE = (224, 224)
EPOCHS = 10 # Train for 10 epochs (sufficient for fine-tuning)

print("Preparing data generators...")
# Data Augmentation for training
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

# Only rescaling NOT here, we will add a Rescaling layer inside the model
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

# Save class map
class_indices = train_generator.class_indices
print("Class Indices:", class_indices)

# We'll save it as both class_map.json and class_map_top20.json to ensure it's picked up
with open(MODELS_DIR / "class_map.json", "w") as f:
    json.dump(class_indices, f)
with open(MODELS_DIR / "class_map_top20.json", "w") as f:
    json.dump(class_indices, f)

num_classes = len(class_indices)

print("Building model...")
# EfficientNetB0 base
base_model = tf.keras.applications.EfficientNetB0(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet',
    pooling='avg'
)
base_model.trainable = False # Freeze base model initially

# Build model
inputs = tf.keras.Input(shape=(224, 224, 3))
# We add a rescaling layer with name="rescaling" for identification.
# EfficientNet expects [0, 255] input, so scale=1.0 is used.
x = tf.keras.layers.Rescaling(1.0, name="rescaling")(inputs)
x = base_model(x, training=False)
x = tf.keras.layers.Dropout(0.4)(x) 
outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("Starting training (Phase 1: Frozen Base)...")
history1 = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=test_generator
)

print("Starting training (Phase 2: Fine-Tuning)...")
# Unfreeze top layers of the base model
base_model.trainable = True
for layer in base_model.layers[:100]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history2 = model.fit(
    train_generator,
    epochs=5,
    validation_data=test_generator
)

# Evaluate
loss, accuracy = model.evaluate(test_generator)
print(f"Test Accuracy: {accuracy*100:.2f}%")

# Save the models
model.save(MODELS_DIR / "plant_health_model.h5")
model.save(MODELS_DIR / "plant_health_model_top20.h5") # Ensure it overrides candidates

print("Model training complete and saved successfully!")
