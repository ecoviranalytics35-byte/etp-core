import { Briefcase, UserRound } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

/**
 * Toggle between Client and Provider mode for the current account.
 * If the user doesn't have the provider role yet, switching to Provider
 * grants it on the fly.
 */
export function RoleSwitcher({ className }: { className?: string }) {
  const { profile, roles, setActiveRole, addRole } = useAuth();
  if (!profile) return null;

  const active = profile.active_role;

  const switchTo = async (role: AppRole) => {
    if (role === "provider" && !roles.includes("provider")) {
      await addRole("provider");
    }
    if (role === "client" && !roles.includes("client")) {
      await addRole("client");
    }
    await setActiveRole(role);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card p-1 text-xs shadow-sm",
        className,
      )}
      role="group"
      aria-label="Switch between Client and Provider mode"
    >
      <button
        type="button"
        onClick={() => switchTo("client")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors",
          active === "client"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <UserRound className="h-3.5 w-3.5" />
        Client
      </button>
      <button
        type="button"
        onClick={() => switchTo("provider")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors",
          active === "provider"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Briefcase className="h-3.5 w-3.5" />
        Provider
      </button>
    </div>
  );
}
