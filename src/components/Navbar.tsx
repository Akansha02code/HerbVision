import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X, Globe } from "lucide-react";

const languages = ["EN", "हिंदी", "मराठी"];

const navLinks = [
  { label: "Identify", href: "#identify" },
  { label: "Care Plan", href: "#care" },
  { label: "AI Chat", href: "#chat" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState(0);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Herb<span className="gradient-text">Vision</span>
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setLang((l) => (l + 1) % languages.length)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Globe className="h-3.5 w-3.5" />
            {languages[lang]}
          </button>
          <a
            href="#identify"
            className="rounded-full gradient-hero px-5 py-2 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated"
          >
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#identify"
                className="inline-block rounded-full gradient-hero px-5 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
