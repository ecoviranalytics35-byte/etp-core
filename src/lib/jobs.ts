export const JOB_CATEGORIES = [
  "Software & IT",
  "Design & Creative",
  "Marketing & Sales",
  "Writing & Translation",
  "Engineering & Architecture",
  "Finance & Accounting",
  "Legal & Compliance",
  "Logistics & Trade",
  "Manufacturing & Sourcing",
  "Consulting & Strategy",
  "Operations & Admin",
  "Other",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "TRY", symbol: "₺", label: "Turkish Lira" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "TR", name: "Türkiye" },
  { code: "US", name: "United States" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
];

export function formatBudget(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string,
): string {
  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "";
  const fmt = (n: number) =>
    `${sym}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)} ${currency}`;
  if (min != null) return `${fmt(min)}+ ${currency}`;
  if (max != null) return `Up to ${fmt(max)} ${currency}`;
  return "Budget on request";
}

export function countryName(code: string | null | undefined): string {
  if (!code) return "Global";
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
