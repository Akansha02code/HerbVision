import os
import shutil
import random
from pathlib import Path

random.seed(42)

BASE_DIR = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend")
DATASETS_DIR = BASE_DIR / "Indian Medicinal Leaves Image Datasets"
LEAF_DIR = DATASETS_DIR / "Medicinal Leaf dataset"
PLANT_DIR = DATASETS_DIR / "Medicinal plant dataset"
OUT_DIR = BASE_DIR / "dataset_top5"

# Define the top 5 classes and their corresponding folder names in both datasets
CLASSES = {
    "Tulsi": {"leaf": "Tulsi", "plant": "Tulasi"},
    "Neem": {"leaf": "Neem", "plant": "Neem"},
    "Aloevera": {"leaf": "Aloevera", "plant": "Aloevera"},
    "Mint": {"leaf": "Mint", "plant": "Mint"},
    "Betel": {"leaf": "Betel", "plant": "Betel"}
}

def clean_unnecessary_files():
    print("Cleaning up old files and directories...")
    # Files to keep
    keep_files = ["main.py", "model.py", "knowledge_base.json", "requirements.txt", "keras_layers.py"]
    
    # Directories to keep
    keep_dirs = ["Indian Medicinal Leaves Image Datasets", "models", "__pycache__", ".venv"]
    
    for item in BASE_DIR.iterdir():
        if item.name == "setup_top5_dataset.py" or item.name == "train_top5.py":
            continue
            
        if item.is_file() and item.name not in keep_files and not item.name.startswith("."):
            print(f"Removing file: {item.name}")
            item.unlink()
        elif item.is_dir() and item.name not in keep_dirs and not item.name.startswith("."):
            print(f"Removing directory: {item.name}")
            shutil.rmtree(item)

def prepare_data():
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
        
    train_dir = OUT_DIR / "train"
    test_dir = OUT_DIR / "test"
    
    train_dir.mkdir(parents=True, exist_ok=True)
    test_dir.mkdir(parents=True, exist_ok=True)
    
    print("Preparing dataset for top 5 plants...")
    
    for class_name, folder_names in CLASSES.items():
        (train_dir / class_name).mkdir(exist_ok=True)
        (test_dir / class_name).mkdir(exist_ok=True)
        
        images = []
        
        # Gather from Leaf Dataset
        leaf_folder = LEAF_DIR / folder_names["leaf"]
        if leaf_folder.exists():
            for img in leaf_folder.glob("*.*"):
                if img.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                    images.append(img)
        
        # Gather from Plant Dataset
        plant_folder = PLANT_DIR / folder_names["plant"]
        if plant_folder.exists():
            for img in plant_folder.glob("*.*"):
                if img.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                    images.append(img)
                    
        # Remove duplicates by checking filenames (sometimes they are the same)
        # Actually, let's just make sure they have a unique new name
        
        # Shuffle and split 80/20
        random.shuffle(images)
        split_idx = int(len(images) * 0.8)
        train_imgs = images[:split_idx]
        test_imgs = images[split_idx:]
        
        print(f"Class {class_name}: {len(train_imgs)} train, {len(test_imgs)} test")
        
        for i, img in enumerate(train_imgs):
            dst = train_dir / class_name / f"{class_name}_train_{i}{img.suffix}"
            shutil.copy2(img, dst)
            
        for i, img in enumerate(test_imgs):
            dst = test_dir / class_name / f"{class_name}_test_{i}{img.suffix}"
            shutil.copy2(img, dst)

if __name__ == "__main__":
    clean_unnecessary_files()
    prepare_data()
    print("Dataset preparation complete!")
