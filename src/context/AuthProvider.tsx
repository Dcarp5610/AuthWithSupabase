/*
 * This file manages authentication state for the whole app using React Context.
 * The AuthProvider takes children as its only prop and wraps the app in _layout.tsx.
 * On launch it restores any saved Supabase session and then listens for auth changes,
 * so sign-in, sign-up, sign-out and token refreshes all update the shared state.
 * It outputs the session, user, loading flag, and the signUp, signIn and signOut
 * functions, which any screen can read through the useAuth hook.
 */

// ===== Imports =====
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

// ===== Types =====
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// ===== Context =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Provider Component =====
export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth state shared with the rest of the app
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the user directly from the session instead of storing it separately.
  const user = session?.user ?? null;

  // ----- Session Restore And Auth Listener -----
  useEffect(() => {
    // Runs whenever the user signs in, signs out, or the token refreshes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Load any session saved from a previous launch
    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(data.session);
      } catch (error) {
        console.error("Error restoring session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Stop listening when the provider unmounts
    return () => subscription.unsubscribe();
  }, []);

  // ----- Auth Actions -----
  // Each action throws the Supabase error so the screen can show a message.
  // The auth listener above updates the session after each successful call.
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  // ----- Render -----
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ===== useAuth Hook =====
// Gives components access to the auth state and actions
export function useAuth() {
  const context = useContext(AuthContext);

  // Catches the mistake of using useAuth outside the AuthProvider
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
