import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Leaf, AlertTriangle, CheckCircle, Loader2, Sprout, Droplets, Sun } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL?.trim() || window.location.origin;
const API_BASE_URL = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;

interface PredictionResult {
  plant_name: string;
  confidence: number;
  medicinal_uses: string[];
  care: {
    water: string;
    sunlight: string;
    soil: string;
  };
  care_suggestion: string;
}

const SUPPORTED_PLANTS = [
  "Tulsi", "Neem", "Aloevera", "Mint", "Betel"
] as const;

const PlantIdentification = () => {
  const [file, setFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);
  const [resultData, setResultData] = useState<PredictionResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useState<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      const video = document.getElementById("camera-preview") as HTMLVideoElement;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setAnalysisError("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    const video = document.getElementById("camera-preview") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const fileUrl = URL.createObjectURL(blob);
          setFile(fileUrl);
          const imageFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          runAnalysis(imageFile);
          stopCamera();
        }
      }, "image/jpeg");
    }
  };

  const stopCamera = () => {
    const video = document.getElementById("camera-preview") as HTMLVideoElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    setShowCamera(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(URL.createObjectURL(f));
      runAnalysis(f);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(URL.createObjectURL(f));
      runAnalysis(f);
    }
  };

  const runAnalysis = async (imageFile?: File) => {
    if (!imageFile && !file) return;

    setAnalyzing(true);
    setResult(false);
    setResultData(null);
    setAnalysisError(null);

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (file) {
      // If we only have the blob URL, we'd need to fetch it first to get the blob
      try {
        const response = await fetch(file);
        const blob = await response.blob();
        formData.append("image", blob, "plant.jpg");
      } catch (e) {
        console.error("Error preparing image for API", e);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let backendDetail = "Prediction failed.";
        try {
          const errorData = await response.json();
          if (typeof errorData?.detail === "string") {
            backendDetail = errorData.detail;
          }
        } catch {
          backendDetail = `Prediction failed (status ${response.status}).`;
        }
        throw new Error(backendDetail);
      }

      const data = await response.json();
      setResultData(data);
      setResult(true);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Unable to analyze image right now.";
      const message =
        rawMessage.toLowerCase().includes("failed to fetch")
          ? "Cannot reach backend API. Start backend on port 8000 and verify CORS/API URL settings."
          : rawMessage;
      setAnalysisError(message);
      setResult(false);
      setResultData(null);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section id="identify" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            Plant Scanner
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-5xl">
            Identify & <span className="gradient-text">Diagnose</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Upload a photo or scan with your camera to instantly identify medicinal plants and detect diseases.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {SUPPORTED_PLANTS.map((plant) => (
              <span key={plant} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-[11px] font-medium text-primary/70">
                {plant}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-8"
          >
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 transition-colors hover:border-primary/50 overflow-hidden"
            >
              {showCamera ? (
                <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center">
                  <video 
                    id="camera-preview" 
                    className="h-full w-full object-cover"
                    autoPlay 
                    playsInline
                  />
                  <div className="absolute bottom-4 flex gap-4">
                    <button 
                      onClick={captureImage}
                      className="rounded-full bg-primary p-4 text-white hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={stopCamera}
                      className="rounded-full bg-destructive p-4 text-white hover:bg-destructive/90 transition-colors"
                    >
                      <AlertTriangle className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : file ? (
                <img src={file} alt="Uploaded plant" className="h-60 w-60 rounded-2xl object-cover" />
              ) : (
                <>
                  <Upload className="mb-4 h-12 w-12 text-primary/50" />
                  <p className="text-sm font-medium text-foreground">Drag & drop plant image</p>
                  <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
                </>
              )}
              {!showCamera && (
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 cursor-pointer opacity-0" 
                  onChange={handleFileChange} 
                />
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                <Upload className="h-4 w-4" />
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <button
                onClick={startCamera}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl gradient-hero py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                Camera Scan
              </button>
            </div>

            {analyzing && (
              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Analyzing with AI...
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full gradient-hero"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-8"
          >
            {!result ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-muted-foreground">
                <Leaf className="mb-3 h-16 w-16 text-primary/20" />
                <p className="text-sm">Upload a plant image to see results</p>
                {analysisError && (
                  <p className="mt-3 max-w-sm rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                    {analysisError}
                  </p>
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Header Card */}
                <div className="flex items-center gap-5 p-2">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                      <Leaf className="h-10 w-10 text-primary" />
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-2xl font-bold text-foreground">{resultData?.plant_name}</h3>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Identified</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">
                        <span>Confidence Level</span>
                        <span className="text-primary">{Math.round((resultData?.confidence || 0) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden border border-border/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(resultData?.confidence || 0) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medicinal Uses Section */}
                <div className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="bg-primary/10 px-5 py-3 border-b border-primary/10 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Medicinal Uses & Benefits</h4>
                  </div>
                  <div className="p-5">
                    <ul className="grid grid-cols-1 gap-2.5">
                      {resultData?.medicinal_uses.map((item, idx) => (
                        <motion.li 
                          key={`use-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 rounded-xl bg-background/50 p-3 text-sm text-foreground border border-border/50 hover:border-primary/20 transition-colors"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Smart Care Section */}
                <div className="overflow-hidden rounded-2xl border border-secondary/50 bg-secondary/5">
                  <div className="bg-secondary/20 px-5 py-3 border-b border-secondary/50 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-secondary/40 flex items-center justify-center">
                      <Sprout className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Smart Care Suggestions</h4>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="rounded-xl bg-background/40 p-3 border border-border/30 italic text-sm text-muted-foreground leading-relaxed">
                      "{resultData?.care_suggestion}"
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-blue-500/5 p-3 border border-blue-500/10 text-center hover:bg-blue-500/10 transition-colors">
                        <Droplets className="mx-auto h-5 w-5 text-blue-500 mb-1" />
                        <p className="text-[10px] uppercase font-bold text-blue-500/70 mb-1">Water</p>
                        <p className="text-[11px] font-semibold leading-tight">{resultData?.care.water}</p>
                      </div>
                      <div className="rounded-xl bg-amber-500/5 p-3 border border-amber-500/10 text-center hover:bg-amber-500/10 transition-colors">
                        <Sun className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                        <p className="text-[10px] uppercase font-bold text-amber-500/70 mb-1">Sunlight</p>
                        <p className="text-[11px] font-semibold leading-tight">{resultData?.care.sunlight}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-500/5 p-3 border border-emerald-500/10 text-center hover:bg-emerald-500/10 transition-colors">
                        <Sprout className="mx-auto h-5 w-5 text-emerald-500 mb-1" />
                        <p className="text-[10px] uppercase font-bold text-emerald-500/70 mb-1">Soil</p>
                        <p className="text-[11px] font-semibold leading-tight">{resultData?.care.soil}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlantIdentification;
