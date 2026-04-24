import tensorflow as tf
from pathlib import Path

MODEL_PATH = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend\models\plant_health_model.h5")
model = tf.keras.models.load_model(MODEL_PATH, compile=False)
model.summary()
