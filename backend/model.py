import io
import json
import os
from pathlib import Path
from typing import Dict, Tuple

import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
# Model candidates: Use TFLite for production (Render) to avoid OOM
MODEL_CANDIDATES = [
    MODELS_DIR / "model.tflite",
    MODELS_DIR / "plant_health_model_top20.h5",
    MODELS_DIR / "plant_health_model.h5",
]
CLASS_MAP_CANDIDATES = [
    MODELS_DIR / "class_map_top20.json",
    MODELS_DIR / "class_map.json",
]

DEFAULT_PLANT = "Tulsi"


def load_class_map() -> Dict[str, int]:
    env_path = os.getenv("HERBALAI_CLASS_MAP_PATH")
    if env_path:
        p = Path(env_path)
        if p.exists():
            data = json.loads(p.read_text(encoding="utf-8"))
            return {str(k): int(v) for k, v in data.items()}

    for path in CLASS_MAP_CANDIDATES:
        if path.exists():
            with path.open("r", encoding="utf-8") as f:
                data = json.load(f)
            # Normalize values to int (older files may store strings)
            return {str(k): int(v) for k, v in data.items()}
    return {"Tulsi": 0, "Neem": 1}


def load_model():
    # Force use of TFLite if available (Highly recommended for Render 512MB RAM)
    tflite_path = MODELS_DIR / "model.tflite"
    if tflite_path.exists():
        try:
            # We use tflite_runtime (lighter) if available, else tensorflow
            try:
                import tflite_runtime.interpreter as tflite
            except ImportError:
                try:
                    import tensorflow.lite as tflite
                except ImportError:
                    tflite = None
            
            if tflite:
                interpreter = tflite.Interpreter(model_path=str(tflite_path))
                interpreter.allocate_tensors()
                return {"type": "tflite", "interpreter": interpreter}
        except Exception as e:
            print(f"Error loading TFLite model: {e}")

    try:
        import tensorflow as tf
        # Ensure any custom layers used during training are registered for deserialization.
        try:
            import backend.keras_layers  # noqa: F401
        except Exception:
            try:
                import keras_layers  # type: ignore # noqa: F401
            except Exception:
                pass

        env_path = os.getenv("HERBALAI_MODEL_PATH")
        if env_path:
            p = Path(env_path)
            if p.exists():
                return tf.keras.models.load_model(p, compile=False)

        for path in MODEL_CANDIDATES:
            if path.exists():
                return tf.keras.models.load_model(path, compile=False)
    except Exception:
        return None
    return None


def _preprocess_raw(image_bytes: bytes, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    arr = np.array(image).astype(np.float32)
    arr = np.expand_dims(arr, axis=0)
    return arr


def _model_has_built_in_preprocess(model) -> bool:
    try:
        layer_names = {getattr(l, "name", "") for l in getattr(model, "layers", [])}
        return any(name in layer_names for name in {"preprocess", "rescaling"})
    except Exception:
        return False


def preprocess_image(image_bytes: bytes, target_size: Tuple[int, int] = (224, 224), model=None) -> np.ndarray:
    arr = _preprocess_raw(image_bytes=image_bytes, target_size=target_size)

    # If the model already contains a preprocessing layer, don't preprocess again.
    if model is not None and _model_has_built_in_preprocess(model):
        return arr

    preprocess_mode = (os.getenv("HERBALAI_PREPROCESS") or "auto").strip().lower()
    if preprocess_mode in {"rescale", "rescale_0_1", "divide_255"}:
        return arr / 255.0

    # Keep preprocessing consistent with EfficientNet training (preprocess_input expects 0..255 float input).
    try:
        import tensorflow as tf

        if preprocess_mode in {"efficientnet", "imagenet"}:
            return tf.keras.applications.efficientnet.preprocess_input(arr)

        # auto: prefer legacy rescale to preserve old models unless explicitly overridden
        return arr / 255.0
    except Exception:
        return arr / 255.0


def predict_from_image(model, class_map: Dict[str, int], image_bytes: bytes):
    if model is None or not class_map:
        return {
            "plant_name": DEFAULT_PLANT,
            "confidence": 0.77,
        }

    # Handle TFLite (Ultra-low RAM mode)
    if isinstance(model, dict) and model.get("type") == "tflite":
        interpreter = model["interpreter"]
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        input_shape = input_details[0]['shape']
        input_arr = preprocess_image(image_bytes, target_size=(input_shape[1], input_shape[2]), model=model)
        
        interpreter.set_tensor(input_details[0]['index'], input_arr)
        interpreter.invoke()
        
        plant_logits = interpreter.get_tensor(output_details[0]['index'])
    else:
        # Standard Keras model
        input_arr = preprocess_image(image_bytes, model=model)
        try:
            out = model.predict(input_arr)
            if isinstance(out, dict):
                plant_logits = out.get("plant")
                if plant_logits is None:
                    plant_logits = next(iter(out.values()))
            elif isinstance(out, list):
                plant_logits = out[0] if out else out
            else:
                plant_logits = out
        except Exception:
            return {
                "plant_name": DEFAULT_PLANT,
                "confidence": 0.77,
            }

    inv_map = {int(v): k for k, v in class_map.items()}

    plant_scores = np.asarray(plant_logits)[0]
    plant_idx = int(np.argmax(plant_scores))
    plant_name = inv_map.get(plant_idx, DEFAULT_PLANT)
    confidence = float(np.max(plant_scores))

    return {
        "plant_name": plant_name,
        "confidence": float(round(confidence, 4)),
    }
