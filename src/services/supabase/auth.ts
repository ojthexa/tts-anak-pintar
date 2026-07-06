/**
 * Authentication service using Supabase Auth
 */

import { getSupabaseClient } from "./client";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  } | null;
  error: string | null;
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: "student" | "teacher" | "parent" = "student",
  grade?: number
): Promise<AuthResponse> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role,
        grade,
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    // Create profile
    await getSupabaseClient().from("profiles").upsert({
      id: data.user.id,
      email,
      display_name: displayName,
      role,
      grade,
      xp: 0,
      coins: 0,
      level: 1,
    });

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
        displayName,
      },
      error: null,
    };
  }

  return { user: null, error: "Failed to create account" };
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    // Update last login
    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
        displayName: data.user.user_metadata.display_name || email.split("@")[0],
        avatarUrl: data.user.user_metadata.avatar_url,
      },
      error: null,
    };
  }

  return { user: null, error: "Login failed" };
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });

  return error?.message || null;
}

/**
 * Update password
 */
export async function updatePassword(password: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error?.message || null;
}
