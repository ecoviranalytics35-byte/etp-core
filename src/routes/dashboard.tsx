import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Briefcase, MessageSquare, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { RoleSwitcher } from "@/components/etp/RoleSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ETP" },
      { name: "description", content: "Your ETP dashboard — switch between client and provider roles, manage jobs, applications, and conversations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }, [user, loading, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const isClient = profile.active_role === "client";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {profile.display_name ?? "trader"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {isClient ? "Client dashboard" : "Provider dashboard"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {isClient
              ? "Post jobs, review applications, and chat with verified providers worldwide."
              : "Browse global opportunities, send applications, and manage your subscription."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="h-3 w-3" style={{ color: "var(--gold)" }} />
            Seriousness {Number(profile.seriousness_score ?? 0).toFixed(0)}
          </Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isClient ? (
          <>
            <DashCard
              icon={<Briefcase className="h-5 w-5" />}
              title="Post a job"
              description="Describe what you need. Providers worldwide will apply."
              cta="Coming in Phase 3"
            />
            <DashCard
              icon={<UserRound className="h-5 w-5" />}
              title="Active jobs"
              description="Track progress on your open job posts."
              cta="0 open"
            />
            <DashCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="Conversations"
              description="Internal chat + WhatsApp with shortlisted providers."
              cta="Coming in Phase 5"
            />
          </>
        ) : (
          <>
            <DashCard
              icon={<Briefcase className="h-5 w-5" />}
              title="Browse jobs"
              description="Find opportunities that match your skills."
              cta="Coming in Phase 3"
            />
            <DashCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Subscription"
              description="Activate Basic or Pro to start applying."
              cta="Coming in Phase 6"
            />
            <DashCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="Conversations"
              description="Chat with clients about active applications."
              cta="Coming in Phase 5"
            />
          </>
        )}
      </div>

      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Foundation phase complete ✦</CardTitle>
          <CardDescription>
            Your account, profile, and dual-role system are ready. Next up: jobs & applications.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function DashCard({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Card className="transition-all hover:shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <div
          className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "var(--gradient-gold)", color: "var(--gold-foreground)" }}
        >
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{cta}</p>
      </CardContent>
    </Card>
  );
}
