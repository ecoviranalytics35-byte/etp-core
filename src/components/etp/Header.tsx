import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { RoleSwitcher } from "./RoleSwitcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const initials = (profile?.display_name ?? user?.email ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Jobs
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user && <RoleSwitcher className="hidden sm:inline-flex" />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? "You"} />
                    )}
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-medium">{profile?.display_name ?? "Account"}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 sm:hidden">
                  <RoleSwitcher />
                </div>
                <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard" })}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/jobs" })}>
                  Browse jobs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => navigate({ to: "/auth", search: { mode: "login" } })}
              >
                Log in
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
              >
                <span className="sm:hidden">Sign in</span>
                <span className="hidden sm:inline">Get started</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
