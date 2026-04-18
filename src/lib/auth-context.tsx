import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "client" | "provider" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  country_code: string | null;
  preferred_currency: string | null;
  active_role: AppRole;
  seriousness_score: number | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setActiveRole: (role: AppRole) => Promise<void>;
  addRole: (role: Exclude<AppRole, "admin">) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [roles, setRoles] = React.useState<AppRole[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadProfileAndRoles = React.useCallback(async (uid: string) => {
    const [{ data: profileData }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((profileData as Profile | null) ?? null);
    setRoles(((roleRows ?? []) as { role: AppRole }[]).map((r) => r.role));
  }, []);

  React.useEffect(() => {
    // CRITICAL: subscribe FIRST, then call getSession
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // defer to avoid deadlock in onAuthStateChange callback
        setTimeout(() => {
          void loadProfileAndRoles(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          void loadProfileAndRoles(data.session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        // Never let the UI hang — surface auth as "logged out" if Supabase errors
        console.error("Supabase getSession failed:", err);
        setLoading(false);
      });

    return () => sub.subscription.unsubscribe();
  }, [loadProfileAndRoles]);

  const refreshProfile = React.useCallback(async () => {
    if (!user) return;
    await loadProfileAndRoles(user.id);
  }, [user, loadProfileAndRoles]);

  const setActiveRole = React.useCallback(
    async (role: AppRole) => {
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({ active_role: role })
        .eq("id", user.id);
      if (!error) {
        setProfile((p) => (p ? { ...p, active_role: role } : p));
      }
    },
    [user],
  );

  const addRole = React.useCallback(
    async (role: Exclude<AppRole, "admin">) => {
      if (!user) return;
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role });
      if (!error) {
        setRoles((r) => (r.includes(role) ? r : [...r, role]));
      }
    },
    [user],
  );

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      roles,
      loading,
      refreshProfile,
      setActiveRole,
      addRole,
      signOut,
    }),
    [user, session, profile, roles, loading, refreshProfile, setActiveRole, addRole, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
