import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./supabase";
import { getProfile, upsertProfile, type Profile } from "./data/profiles";

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refetchProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within an AuthProvider");
  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session) setProfile(await getProfile(data.session.user.id));
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (cancelled) return;
      setSession(newSession);
      setProfile(newSession ? await getProfile(newSession.user.id) : null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // profiles.id references auth.users(id) -- create the row now so
    // onboarding has something to upsert persona/income/goal onto. Skipped
    // if email confirmation is required and no session came back yet.
    if (data.user && data.session) {
      await upsertProfile({ id: data.user.id });
    }
    return { needsEmailConfirmation: !data.session };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // RPC deletes the auth.users row (server-side, security definer); every
  // owned table cascades from there. Session is already dead once the row
  // is gone, but sign out anyway to clear the local AsyncStorage copy.
  const deleteAccount = async () => {
    const { error } = await supabase.rpc("delete_own_account");
    if (error) throw error;
    await supabase.auth.signOut();
  };

  const refetchProfile = async () => {
    if (session) setProfile(await getProfile(session.user.id));
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        deleteAccount,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
