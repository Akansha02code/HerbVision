import { useState } from "react";
import { motion } from "framer-motion";
import { ScanLine, Sprout, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";

import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import HerbalLogo from "@/components/HerbalLogo";
const PlantIdentification = lazy(() => import("@/components/PlantIdentification"));
const CareRecommendation = lazy(() => import("@/components/CareRecommendation"));
const AIChatbot = lazy(() => import("@/components/AIChatbot"));


const tabs = [
  { id: "identify", label: "Identify", icon: ScanLine },
  { id: "care", label: "Care Plan", icon: Sprout },
  { id: "chat", label: "AI Chat", icon: MessageCircle },
];

import Dashboard3DBackground from "@/components/Dashboard3DBackground";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("identify");

  return (
    <div className="relative min-h-screen bg-transparent overflow-x-hidden">
      {/* Immersive 3D Background */}
      <Dashboard3DBackground />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back</span>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <HerbalLogo size={28} />
              <span className="font-display text-lg font-bold text-foreground">
                Herb<span className="gradient-text">Vision</span>
              </span>
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full gradient-hero"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <tab.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main>
        <Suspense fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading component...</span>
          </div>
        }>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "identify" && <PlantIdentification />}
            {activeTab === "care" && <CareRecommendation />}
            {activeTab === "chat" && (
              <section className="py-12 bg-secondary/5 min-h-[calc(100vh-140px)]">
                <div className="container mx-auto px-6 h-full">
                  <div className="mx-auto max-w-4xl h-full flex flex-col glass-strong rounded-3xl p-8 shadow-2xl border border-primary/10">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                          AI Plant <span className="gradient-text">Assistant</span>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Ask anything about medicinal plants, care tips, or disease diagnosis.
                        </p>
                      </div>
                      <div className="hidden sm:block p-3 rounded-2xl bg-primary/10">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 bg-background/50 rounded-2xl p-4 min-h-[500px] border border-border/50">
                      <AIChatbot inline />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </Suspense>
      </main>

      </div>
    </div>
  );
};

export default Dashboard;
