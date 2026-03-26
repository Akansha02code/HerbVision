import { motion } from "framer-motion";
import { ArrowRight, Leaf, ScanLine, Sprout, TrendingUp, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import HerbalLogo from "@/components/HerbalLogo";
const Plant3D = lazy(() => import("@/components/Plant3D"));
import Footer from "@/components/Footer";


const features = [
  { icon: ScanLine, title: "Plant Identification", desc: "AI-powered scan to identify any medicinal plant instantly" },
  { icon: Sprout, title: "Smart Care Plans", desc: "Personalized growing recommendations based on your environment" },
  { icon: TrendingUp, title: "Growth Prediction", desc: "Weather & soil-based analytics for growth success probability" },
  { icon: MessageCircle, title: "AI Assistant", desc: "Multilingual chatbot for all your herbal medicine queries" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <HerbalLogo size={32} />
            <span className="font-display text-xl font-bold text-foreground">
              Herb<span className="gradient-text">Vision</span>
            </span>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full gradient-hero px-5 py-2 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
          <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-leaf/10 blur-3xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent/10 blur-3xl animate-pulse-soft" style={{ animationDelay: "3s" }} />
        </div>

        <div className="container relative z-10 mx-auto grid items-center gap-8 px-6 pt-24 lg:grid-cols-2">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              🌿 AI-Powered Plant Intelligence
            </span>

            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Smart Medicinal Plant{" "}
              <span className="gradient-text">Care System</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Identify, Diagnose, Predict, and Care — All in One Intelligent
              Platform powered by advanced AI.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="group flex items-center gap-2 rounded-full gradient-hero px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-105"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-12 flex gap-8">
              {[
                { value: "10K+", label: "Plants Identified" },
                { value: "98%", label: "AI Accuracy" },
                { value: "50+", label: "Disease Models" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold gradient-text">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3D Plant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Suspense fallback={
              <div className="flex h-[400px] w-full items-center justify-center rounded-3xl bg-primary/5">
                <div className="h-20 w-20 animate-pulse rounded-full bg-primary/20" />
              </div>
            }>
              <Plant3D />
            </Suspense>
          </motion.div>

        </div>
      </section>

      {/* Features overview */}
      <section className="py-24 gradient-hero-soft">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need for <span className="gradient-text">Plant Care</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Powered by AI to give you the best medicinal plant growing experience.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-strong rounded-2xl p-6 text-center transition-transform hover:scale-105"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-hero">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full gradient-hero px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-105"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
