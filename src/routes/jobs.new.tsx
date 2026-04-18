import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, CURRENCIES, JOB_CATEGORIES } from "@/lib/jobs";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "Post a job — ETP" },
      { name: "description", content: "Post a new job on ETP and reach providers worldwide." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PostJobPage,
});

function PostJobPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [countryCode, setCountryCode] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.preferred_currency) setCurrency(profile.preferred_currency);
    if (profile?.country_code) setCountryCode(profile.country_code);
  }, [profile]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const isClient = profile?.active_role === "client";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || title.trim().length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }
    if (!description.trim() || description.trim().length < 30) {
      toast.error("Description must be at least 30 characters");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    const min = budgetMin ? Number(budgetMin) : null;
    const max = budgetMax ? Number(budgetMax) : null;
    if (min != null && (isNaN(min) || min < 0)) {
      toast.error("Minimum budget must be a positive number");
      return;
    }
    if (max != null && (isNaN(max) || max < 0)) {
      toast.error("Maximum budget must be a positive number");
      return;
    }
    if (min != null && max != null && min > max) {
      toast.error("Minimum cannot exceed maximum");
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        posted_by: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        budget_min: min,
        budget_max: max,
        currency,
        country_code: countryCode || null,
      })
      .select("id")
      .single();
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job posted");
    navigate({ to: "/jobs/$jobId", params: { jobId: data!.id } });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Post a job</CardTitle>
          <CardDescription>
            Be specific. Strong briefs attract serious providers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isClient && (
            <div className="mb-6 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
              <p className="font-medium">You're currently in Provider mode.</p>
              <p className="mt-1 text-muted-foreground">
                Switch to Client mode (top-right) to post a job.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior React engineer for SaaS dashboard"
                maxLength={140}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Scope, deliverables, timeline, requirements…"
                rows={8}
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/5000 · Minimum 30 characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Country (optional)</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Global / select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bmin">Budget min</Label>
                <Input
                  id="bmin"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bmax">Budget max</Label>
                <Input
                  id="bmax"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="2000"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/jobs" })}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !isClient}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
