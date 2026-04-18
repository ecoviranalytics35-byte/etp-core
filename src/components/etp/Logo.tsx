import { Link } from "@tanstack/react-router";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className ?? ""}`}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:scale-105">
        <span className="font-display text-sm font-bold tracking-tight">E</span>
        <span
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
          style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
          aria-hidden
        />
      </div>
      <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight">
        ETP<span className="hidden text-muted-foreground sm:inline"> · Ecovira</span>
      </span>
    </Link>
  );
}
