import { motion } from "framer-motion";
import { CloudSun, Thermometer, Droplets, AlertTriangle, TrendingUp } from "lucide-react";

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={r} fill="none"
            stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(152,55%,35%)" />
              <stop offset="100%" stopColor="hsl(95,50%,48%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
};

const GrowthPrediction = () => {
  return (
    <section id="growth" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">Analytics</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-5xl">
            Growth <span className="gradient-text">Prediction</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            AI-powered growth analysis based on weather, soil data, and regional conditions.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Weather card */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-strong rounded-3xl p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <CloudSun className="h-5 w-5 text-primary" /> Weather Data
            </h3>
            <div className="mt-5 space-y-4">
              {[
                { icon: Thermometer, label: "Temperature", value: "28°C" },
                { icon: Droplets, label: "Humidity", value: "72%" },
                { icon: CloudSun, label: "Rainfall", value: "120mm/month" },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <d.icon className="h-4 w-4 text-primary" />{d.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Prediction */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-6 flex flex-col items-center justify-center">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground mb-4">
              <TrendingUp className="h-5 w-5 text-primary" /> Growth Success
            </h3>
            <CircularProgress value={87} label="Growth Probability" />
            <div className="mt-4 w-full rounded-xl bg-primary/10 px-4 py-2 text-center">
              <span className="text-xs font-semibold text-primary">✓ Climate Suitable</span>
            </div>
          </motion.div>

          {/* Risks */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-strong rounded-3xl p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Risk Warnings
            </h3>
            <div className="mt-5 space-y-3">
              {[
                { level: "Low", text: "Soil pH slightly acidic – add lime", color: "bg-leaf/10 text-leaf" },
                { level: "Medium", text: "Heavy rain expected – improve drainage", color: "bg-accent/20 text-earth" },
                { level: "Low", text: "Pest activity moderate this season", color: "bg-leaf/10 text-leaf" },
              ].map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${r.color}`}>{r.level}</span>
                  <p className="mt-1 text-sm text-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GrowthPrediction;
