const HerbalLogo = ({ size = 36, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* DNA Helix left strand */}
    <path
      d="M18 8C18 8 26 16 26 24C26 32 18 40 18 48C18 52 20 56 24 56"
      stroke="hsl(152,55%,35%)"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* DNA Helix right strand */}
    <path
      d="M38 8C38 8 30 16 30 24C30 32 38 40 38 48C38 52 36 56 32 56"
      stroke="hsl(95,50%,48%)"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cross bars */}
    <line x1="20" y1="16" x2="36" y2="16" stroke="hsl(152,55%,35%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="19" y1="24" x2="37" y2="24" stroke="hsl(152,55%,35%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="19" y1="32" x2="37" y2="32" stroke="hsl(95,50%,48%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="20" y1="40" x2="36" y2="40" stroke="hsl(95,50%,48%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    {/* Leaf sprouting from top of helix */}
    <path
      d="M28 8C28 8 36 2 46 4C46 4 44 14 36 18C32 20 28 16 28 12"
      fill="url(#leafGrad)"
      stroke="hsl(152,55%,35%)"
      strokeWidth="1.5"
    />
    {/* Leaf vein */}
    <path
      d="M30 10C30 10 36 6 42 6"
      stroke="hsl(0,0%,100%)"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.6"
    />
    <defs>
      <linearGradient id="leafGrad" x1="28" y1="4" x2="46" y2="18">
        <stop offset="0%" stopColor="hsl(152,55%,35%)" />
        <stop offset="100%" stopColor="hsl(95,50%,48%)" />
      </linearGradient>
    </defs>
  </svg>
);

export default HerbalLogo;
