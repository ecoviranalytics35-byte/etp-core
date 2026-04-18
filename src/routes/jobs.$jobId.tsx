import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Globe2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryName, formatBudget, timeAgo } from "@/lib/jobs";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job — ETP" },
      { name: "description", content: "View job details on ETP." },
    ],
  }),
  component: JobDetailPage,
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

const STATUS_OPTIONS: { value: JobRow["status"]; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setJob((data as JobRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-semibold">Job not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This job may have been removed or is no longer open.
        </p>
        <Button asChild className="mt-6">
          <Link to="/jobs">Browse open jobs</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === job.posted_by;

  async function handleStatusChange(value: string) {
    if (!job || !isOwner) return;
    setUpdating(true);
    const { error } = await supabase
      .from("jobs")
      .update({ status: value as JobRow["status"] })
      .eq("id", job.id);
    setUpdating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setJob({ ...job, status: value as JobRow["status"] });
    toast.success("Status updated");
  }

  async function handleDelete() {
    if (!job || !isOwner) return;
    if (!confirm("Delete this job? This cannot be undone.")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job deleted");
    navigate({ to: "/jobs" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <Card className="mt-4">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{job.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Globe2 className="h-3 w-3" />
                  {countryName(job.country_code)}
                </Badge>
                <StatusBadge status={job.status} />
                <span className="text-xs text-muted-foreground">
                  · Posted {timeAgo(job.created_at)}
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                {job.title}
              </h1>
              <p
                className="mt-2 font-display text-lg font-semibold"
                style={{ color: "var(--gold)" }}
              >
                {formatBudget(job.budget_min, job.budget_max, job.currency)}
              </p>
            </div>
          </div>

          <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {job.description}
          </div>

          {isOwner && (
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Owner controls
              </span>
              <Select
                value={job.status}
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="w-[180px]">
                  {updating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}

          {!isOwner && (
            <div className="mt-8 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
              Applications open in Phase 3 — providers will be able to apply directly from here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: JobRow["status"] }) {
  const map: Record<JobRow["status"], { label: string; cls: string }> = {
    open: { label: "Open", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    in_progress: { label: "In progress", cls: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400" },
    closed: { label: "Closed", cls: "border-muted bg-muted text-muted-foreground" },
    cancelled: { label: "Cancelled", cls: "border-destructive/40 bg-destructive/10 text-destructive" },
  };
  const v = map[status];
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}
