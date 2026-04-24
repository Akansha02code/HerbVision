import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Droplets, Sun, Sprout, CheckCircle, Leaf, AlertTriangle } from "lucide-react";

const _apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = _apiUrl.endsWith("/") ? _apiUrl.slice(0, -1) : _apiUrl;

const CareRecommendation = () => {
  const [formData, setFormData] = useState({
    plant: "Tulsi",
    location: "",
    soil: "Loamy",
    sunlight: "Full Sun",
    environment: "Outdoor"
  });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/care-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error("Failed to generate plan");
      
      const data = await response.json();
      setPlan(data);
      setGenerated(true);
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to connect to the backend server. Make sure it's running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="care" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary font-mono tracking-wider">Smart Care Engine</span>
          <h2 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Personalized <span className="gradient-text">Care Plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
            Our AI analyzes your environmental factors to generate a data-backed cultivation strategy.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-strong rounded-[2.5rem] p-10 space-y-6 border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Plant</label>
                <select 
                  value={formData.plant}
                  onChange={(e) => setFormData({...formData, plant: e.target.value})}
                  className="w-full rounded-2xl border border-border bg-background/50 px-4 py-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                >
                  {["Tulsi", "Neem", "Aloevera", "Mint", "Amla", "Ginger", "Rose", "Lemon", "Betel"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">Location Context</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary transition-colors group-focus-within:text-foreground" />
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Mumbai, Delhi" 
                    className="w-full rounded-2xl border border-border bg-background/50 py-4 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">Soil Type</label>
                <select 
                  value={formData.soil}
                  onChange={(e) => setFormData({...formData, soil: e.target.value})}
                  className="w-full rounded-2xl border border-border bg-background/50 px-4 py-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                >
                  <option>Loamy</option>
                  <option>Sandy</option>
                  <option>Clay</option>
                  <option>Silty</option>
                  <option>Peaty</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">Growing Environment</label>
                <div className="flex p-1 rounded-2xl bg-secondary/30 border border-border">
                  {["Indoor", "Outdoor"].map((e) => (
                    <button 
                      key={e} 
                      onClick={() => setFormData({...formData, environment: e})}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.environment === e ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">Sunlight Availability</label>
              <div className="flex gap-3">
                {["Full Sun", "Partial", "Shade"].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setFormData({...formData, sunlight: s})}
                    className={`flex-1 rounded-2xl border-2 py-4 text-center transition-all ${formData.sunlight === s ? "border-primary bg-primary/5 text-primary" : "border-border bg-transparent text-muted-foreground hover:border-primary/30"}`}
                  >
                    <Sun className={`mx-auto mb-2 h-5 w-5 ${formData.sunlight === s ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs font-bold uppercase">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={generatePlan} 
              disabled={loading}
              className={`w-full mt-4 rounded-2xl gradient-hero py-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <Sprout className="h-5 w-5" />
              {loading ? "Generating Plan..." : "Generate Cultivation Plan"}
            </button>
          </motion.div>

          {/* Output */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            {!generated ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-primary/5 p-10 text-center">
                <div className="mb-6 rounded-full bg-primary/10 p-6">
                  <Sprout className="h-12 w-12 text-primary/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Parameters</h3>
                <p className="text-sm text-muted-foreground max-w-xs">Enter your environmental details to receive a customized growth strategy.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full rounded-[2.5rem] bg-card border border-border p-10 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Leaf className="h-40 w-40 text-primary rotate-12" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  {plan.plant} Growth Strategy
                </h3>

                <div className="space-y-6">
                  {/* Growth Score & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Growth Score</p>
                      <div className="text-5xl font-black text-primary">{plan.growth_score}%</div>
                      <p className="mt-2 text-sm font-bold text-foreground">{plan.growth_category}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-secondary/5 border border-border flex flex-col justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Live Forecast</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground italic">Temp:</span>
                        <span className="text-xl font-bold text-foreground">{plan?.weather?.temperature || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground italic">Humidity:</span>
                        <span className="text-xl font-bold text-foreground">{plan?.weather?.humidity || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">AI Condition Analysis</p>
                    <p className="text-sm font-medium text-foreground italic leading-relaxed">
                      "{plan.final_advice}"
                    </p>
                  </div>

                  {/* Risks/Warnings section */}
                  {plan.risks && plan.risks.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-destructive/70 mb-1 ml-2">Potential Risks</p>
                      {plan.risks.map((risk: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-destructive/80">{risk}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1 ml-2">Smart Recommendations</p>
                    <div className="grid grid-cols-1 gap-2">
                      {plan.recommendations.map((rec: string, idx: number) => (
                        <motion.div 
                          key={idx} 
                          className="p-4 rounded-2xl bg-secondary/20 border border-border flex items-start gap-3 hover:border-primary/30 transition-all"
                        >
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-foreground leading-relaxed">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-background text-amber-500 shadow-sm">
                        <Sun className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70">Ideal Standard</h4>
                        <p className="text-[11px] font-bold text-foreground">{plan.base_care?.sunlight} \u2022 {plan.base_care?.water} Watering</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Logic Version: v2.1.0 (Growth Engine Restored)</span>
                  <span className="text-primary italic">Localized for {formData.location || "General Region"}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CareRecommendation;
