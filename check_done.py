import os
import glob
from pathlib import Path
import datetime

MODELS_DIR = Path(r"c:\Users\Akansha Pramod Sahoo\Desktop\projects\ML Project(sem 6)\herbal-ai-garden\backend\models")
h5_files = list(MODELS_DIR.glob("*.h5"))

if not h5_files:
    print("No .h5 files found yet.")
else:
    for f in h5_files:
        mtime = datetime.datetime.fromtimestamp(os.path.getmtime(f))
        print(f"File: {f.name}, Size: {os.path.getsize(f)}, Modified: {mtime}")
