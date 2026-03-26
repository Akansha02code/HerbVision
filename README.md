# HerbVision – Medicinal Plant Identification & Smart Care System

HerbVision is a full-stack medicinal plant intelligence system with:
- React + Vite frontend dashboard
- FastAPI + TensorFlow backend for image-based plant analysis
- Training and data organization scripts for custom model updates

## Core Features

- Plant image upload and AI diagnosis (`/predict` endpoint)
- Confidence-aware species response format
- Dashboard modules for care planning, growth analysis, and assistant UX
- Transfer-learning model pipeline for retraining

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Framer Motion

### Backend
- FastAPI
- TensorFlow / Keras
- Scikit-learn
- Pillow / NumPy

## Project Structure

```text
src/                 # Frontend app (pages, components, UI)
backend/main.py      # FastAPI inference server
backend/predict.py   # Model loading + inference logic
backend/train.py     # Model training pipeline
backend/utils/       # Dataset and label utilities
backend/models/      # Trained model + class mapping
backend/data/        # Organized train/val/test dataset
```

## Local Setup

## 1) Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:8080` by default.

## 2) Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python -m backend.main
```

Backend runs on `http://localhost:8000` by default.

## Environment Variables

### Frontend (`.env`)
- `VITE_API_URL` (default fallback: `http://localhost:8000`)

### Backend (`backend/.env`)
- `ALLOWED_ORIGINS` comma-separated origins for CORS
- `MAX_IMAGE_SIZE_MB` max upload size in MB
- `UPLOAD_DIR` temporary upload directory
- `LOG_LEVEL` logging level (e.g. `INFO`, `DEBUG`)

## Model Training Workflow

### Species-only training (legacy)
```bash
python -m backend.train --data-dir "backend/Indian Medicinal Leaves Image Datasets/Medicinal Leaf dataset" --epochs 25
```

### Train on top-20 classes (Medicinal plant dataset)

1. Build a top-20 subset folder (by class image counts):
```bash
python backend/filter_top20.py --src "backend/Indian Medicinal Leaves Image Datasets/Medicinal plant dataset" --dst backend/top20_plants --top-n 20
```

2. Train on that subset:
```bash
python -m backend.train --data-dir backend/top20_plants --epochs 25
```

3. Evaluate with holdout test set (species):
```bash
python -m backend.evaluate --data-dir "backend/Indian Medicinal Leaves Image Datasets/Medicinal Leaf dataset" --test-size 0.15
```

4. Start inference API:
```bash
python -m backend.main
```

## Robust Species Retraining (Recommended)

Goal: reduce “clean background” overfitting so Google/mobile images work better.

### Phase 1: Train only 9 classes first (Recommended)

1) Ensure your Google images are in class subfolders:
```text
backend/real_world_sorted/<ClassName>/*.jpg
```

2) Build a merged 9-class dataset + a real-world holdout set:
```bash
python -m backend.prepare_real_world_dataset --base-dir backend/top20_plants --realworld-dir backend/real_world_sorted --classes-file backend/classes_9.txt --out-dataset backend/dataset_9_plus_realworld --out-holdout backend/real_world_holdout_9 --holdout-per-class 2 --convert-webp
```

3) Train:
```bash
python -m backend.train --data-dir backend/dataset_9_plus_realworld --epochs 25 --batch-size 16 --resize-to 256 --background-prob 0.6 --noise-std 10 --tag phase1_9
```

4) Real-world test (holdout):
```bash
$env:HERBALAI_MODEL_PATH="backend/models/plant_health_model_phase1_9.h5"; $env:HERBALAI_CLASS_MAP_PATH="backend/models/class_map_phase1_9.json"; python -m backend.real_world_test --labeled-dir backend/real_world_holdout_9 --topk 5
```

### Dataset layout

```text
backend/my_data/
  Neem/*.jpg
  Tulsi/*.jpg
  ...
```

Add diverse images per class (different lighting, angles, zoom, cluttered backgrounds).

### Train (EfficientNetB0 + strong augmentation + background randomization)

```bash
python -m backend.train --data-dir backend/my_data --epochs 25 --batch-size 16 --background-prob 0.6 --noise-std 10 --label-smoothing 0.05 --weight-decay 1e-4
```

Tip: omit `--tag` if you want to overwrite the default `backend/models/plant_health_model_top20.h5` used by the API.

### Evaluate (species)

```bash
python -m backend.evaluate --data-dir backend/my_data --test-size 0.2 --out backend/reports/eval_species.json
```

### Real-world test (Google/mobile photos)

Put a small labeled set in `backend/real_world/<ClassName>/*.jpg` (or provide an unlabeled folder), then:

```bash
python -m backend.real_world_test --labeled-dir backend/real_world --out-csv backend/reports/real_world_preds.csv
```

### Grad-CAM (verify focus on leaf structure)

```bash
python -m backend.gradcam --image path/to/neem.jpg --target plant --out backend/reports/gradcam_neem.png
```

## API

### Health Route
- `GET /`

### Prediction Route
- `POST /predict`
- `multipart/form-data` with field: `image`

Example response:
```json
{
  "plant_name": "Tulsi",
  "confidence": 0.93,
  "medicinal_uses": [
    "Boosts immunity",
    "Helps in cold and cough",
    "Anti-inflammatory"
  ],
  "care": {
    "water": "Moderate",
    "sunlight": "Full Sun",
    "soil": "Well-drained"
  },
  "care_suggestion": "Plant is healthy. Maintain consistent care schedule."
}
```

## Notes

- Keep backend running before using the Identify tab in frontend.
- Some dashboard modules are currently UI-driven/demo style unless connected to additional backend APIs.
