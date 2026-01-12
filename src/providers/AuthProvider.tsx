"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { UserTier } from "@/lib/constants";

interface AuthContextType {
  user: User | null; // Supabase auth user
  profile: any | null; // Supabase profile data
  loading: boolean;
  logout: () => Promise<void>;
  // Helpers to match prototype interface where possible
  tier: UserTier;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  tier: UserTier.SEEKER,
  updateProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user && !profile) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(data);
        } else if (!session?.user) {
          setProfile(null);
        }
      });
      return () => subscription.unsubscribe();
    };
    init();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Refresh server state
    router.push("/login");
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (!error) {
      setProfile((prev: any) => ({ ...prev, ...updates }));
    } else {
      console.error(error);
    }
  };

  // Derived state to match prototype
  const tier = (profile?.tier as UserTier) || UserTier.SEEKER;

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, logout, tier, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
