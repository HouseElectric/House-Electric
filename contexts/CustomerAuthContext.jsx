"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [defaultProperty, setDefaultProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (sessionUser) => {
    if (!sessionUser) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).maybeSingle();
    setProfile(data ?? null);
  };

  // The customer's default property is the single source of truth for "their address" —
  // used to pre-fill/auto-attach a location on bookings instead of a separate profile address.
  const loadDefaultProperty = async (sessionUser) => {
    if (!sessionUser) {
      setDefaultProperty(null);
      return;
    }
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("customer_id", sessionUser.id)
      .eq("is_default", true)
      .maybeSingle();
    setDefaultProperty(data ?? null);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      await Promise.all([loadProfile(session?.user ?? null), loadDefaultProperty(session?.user ?? null)]);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await Promise.all([loadProfile(session?.user ?? null), loadDefaultProperty(session?.user ?? null)]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = () => supabase?.auth.signOut();

  const refreshProfile = () => loadProfile(user);
  const refreshDefaultProperty = () => loadDefaultProperty(user);

  const updateProfile = async (fields) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(fields).eq("id", user.id);
    if (error) throw error;
    await refreshProfile();
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        profile,
        defaultProperty,
        loading,
        signIn,
        signOut,
        refreshProfile,
        refreshDefaultProperty,
        updateProfile,
        supabaseReady: !!supabase,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);
