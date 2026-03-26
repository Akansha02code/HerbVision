import { motion } from "framer-motion";
import { ScanLine, Compass } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-leaf/10 blur-3xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent/10 blur-3xl animate-pulse-soft" style={{ animationDelay: "3s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            🌿 AI-Powered Plant Intelligence
          </span>

          <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            Smart Medicinal Plant{" "}
            <span className="gradient-text">Identification</span> &{" "}
            <span className="gradient-text">Care System</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Identify, Diagnose, Predict, and Care — All in One Intelligent Platform
            powered by advanced AI.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#identify"
              className="group flex items-center gap-2 rounded-full gradient-hero px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-105"
            >
              <ScanLine className="h-4 w-4" />
              Scan Plant
            </a>
            <a
              href="#care"
              className="flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground shadow-card transition-all hover:shadow-elevated hover:scale-105"
            >
              <Compass className="h-4 w-4" />
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-6"
        >
          {[
            { value: "10K+", label: "Plants Identified" },
            { value: "98%", label: "Accuracy Rate" },
            { value: "50+", label: "Disease Models" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <p className="font-display text-2xl font-bold gradient-text md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
