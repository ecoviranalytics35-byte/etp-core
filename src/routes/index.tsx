import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, MessageSquare, Repeat, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ETP — Ecovira Trade Platform | Global B2B service marketplace" },
      {
        name: "description",
        content:
          "ETP connects clients and providers worldwide. One account, dual capability. Premium, structured, global-ready service marketplace.",
      },
      { property: "og:title", content: "ETP — Ecovira Trade Platform" },
      {
        property: "og:description",
        content: "Global B2B service marketplace. Post jobs, find providers, trade with accountability.",
      },
      { name: "twitter:title", content: "ETP — Ecovira Trade Platform" },
      {
        name: "twitter:description",
        content: "Global B2B service marketplace. One account, dual capability.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-border/60"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <Sparkles className="h-3 w-3" style={{ color: "var(--gold)" }} />
              <span>Global B2B service marketplace</span>
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Trade services{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-gold)" }}
              >
                globally
              </span>
              , without friction.
            </h1>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg">
              One account, dual capability. Post a job as a client. Apply for work as a provider.
              Switch modes anytime — built for serious operators across borders.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth" search={{ mode: "login" }}>
                  I already have an account
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to join · Providers subscribe to apply
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for serious cross-border operators
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every detail engineered for accountability, quality, and global scale.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<Repeat className="h-5 w-5" />}
            title="Dual-role accounts"
            text="Switch between Client and Provider mode in one tap. No second sign-up, no second profile."
          />
          <Feature
            icon={<MessageSquare className="h-5 w-5" />}
            title="Hybrid messaging"
            text="Track every conversation in-platform, then move to WhatsApp when it gets serious."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Seriousness Score"
            text="Behavioral scoring filters out tire-kickers. Quality counterparties only."
          />
          <Feature
            icon={<Globe2 className="h-5 w-5" />}
            title="Global by design"
            text="Multi-currency, IP-aware filtering. AUD, USD, EUR, GBP, TRY and growing."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Stripe-powered subscriptions"
            text="Providers subscribe to apply. Premium plan unlocks higher visibility."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="Premium experience"
            text="Designed to feel as serious as the deals you'll close on it."
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to trade?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/70">
            Join the platform built for global service trade. Set up your account in under a minute.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create your account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
      <CardContent className="p-6">
        <div
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: "var(--gradient-gold)", color: "var(--gold-foreground)" }}
        >
          {icon}
        </div>
        <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
