import HerbalLogo from "@/components/HerbalLogo";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container mx-auto px-6">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <HerbalLogo size={28} />
          <span className="font-display text-lg font-bold text-foreground">
            Herb<span className="gradient-text">Vision</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 HerbVision. AI-Powered Smart Medicinal Plant Care System.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
