import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Filter, Globe2, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTRIES,
  JOB_CATEGORIES,
  countryName,
  formatBudget,
  timeAgo,
} from "@/lib/jobs";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Browse jobs — ETP" },
      {
        name: "description",
        content:
          "Browse open service jobs from clients around the world on ETP. Filter by category, country, and keyword.",
      },
      { property: "og:title", content: "Browse jobs — ETP" },
      {
        property: "og:description",
        content: "Global service jobs marketplace. Find your next opportunity.",
      },
    ],
  }),
  component: JobsBrowsePage,
});

interface JobRow {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  country_code: string | null;
  status: "open" | "in_progress" | "closed" | "cancelled";
  created_at: string;
  posted_by: string;
}

function JobsBrowsePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(100);

    if (category !== "all") query = query.eq("category", category);
    if (country !== "all") query = query.eq("country_code", country);

    void query.then(({ data }) => {
      if (cancelled) return;
      setJobs((data as JobRow[] | null) ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [category, country]);

  const filtered = q.trim()
    ? jobs.filter((j) =>
        (j.title + " " + j.description + " " + j.category)
          .toLowerCase()
          .includes(q.trim().toLowerCase()),
      )
    : jobs;

  const isClient = profile?.active_role === "client";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse jobs
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open opportunities from clients worldwide.
          </p>
        </div>
        {isClient && (
          <Button onClick={() => navigate({ to: "/jobs/new" })}>
            <Plus className="mr-2 h-4 w-4" />
            Post a job
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, description, category…"
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {JOB_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <Globe2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mt-6 grid gap-3">
        {loading ? (
          <>
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
          </>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "var(--gradient-gold)", color: "var(--gold-foreground)" }}
              >
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">No jobs match yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters {isClient ? "— or post the first one." : "."}
                </p>
              </div>
              {isClient && (
                <Button onClick={() => navigate({ to: "/jobs/new" })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post a job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filtered.map((j) => (
            <Link
              key={j.id}
              to="/jobs/$jobId"
              params={{ jobId: j.id }}
              className="group block"
            >
              <Card className="transition-all group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-elegant)]">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold tracking-tight">
                        {j.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {j.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{j.category}</Badge>
                        <Badge variant="outline" className="gap-1">
                          <Globe2 className="h-3 w-3" />
                          {countryName(j.country_code)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          · {timeAgo(j.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-display text-sm font-semibold"
                        style={{ color: "var(--gold)" }}
                      >
                        {formatBudget(j.budget_min, j.budget_max, j.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
