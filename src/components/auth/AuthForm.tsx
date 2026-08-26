"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type AuthFormMode = "signin" | "signup";
type AuthFormStatus = "idle" | "submitting" | "error" | "check-email";
type ResendState = "idle" | "sending" | "sent" | "error";

const RESEND_COOLDOWN_SECONDS = 30;

const OAUTH_PROVIDERS = [
  { provider: "google", label: "Continue with Google" },
  { provider: "github", label: "Continue with GitHub" },
] as const;

type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]["provider"];

function humanizeAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials"))
    return "That email and password combination does not match an account.";
  if (normalized.includes("already registered") || normalized.includes("already exists"))
    return "An account with this email already exists. Try signing in instead.";
  if (normalized.includes("email not confirmed"))
    return "Check your inbox and confirm your email before signing in.";
  if (normalized.includes("rate limit") || normalized.includes("too many"))
    return "Too many attempts right now. Wait a moment and try again.";
  if (normalized.includes("password should be"))
    return "Choose a longer password — at least six characters.";
  if (normalized.includes("valid email"))
    return "That does not look like a valid email address.";
  if (normalized.includes("fetch") || normalized.includes("network"))
    return "Could not reach the auth service. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

export default function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthFormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resendState, setResendState] = useState<ResendState>("idle");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const isSignUp = mode === "signup";
  const submitting = status === "submitting";
  const resending = resendState === "sending";

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  function fail(message: string) {
    setStatus("error");
    setErrorMessage(message);
  }

  async function handleResend() {
    const client = getSupabaseBrowser();
    if (!client || !email) return;
    setResendState("sending");
    setResendMessage(null);
    try {
      const { error } = await client.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setResendState("sent");
      setResendMessage("Sent — check again");
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (caught) {
      setResendState("error");
      setResendMessage(
        humanizeAuthError(
          caught instanceof Error ? caught.message : "",
        ),
      );
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    const client = getSupabaseBrowser();
    if (!client) {
      fail("Accounts are not configured yet.");
      return;
    }
    try {
      await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      fail("Could not start that provider sign-in. Please try again.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowser();
    if (!client) {
      fail("Accounts are not configured yet.");
      return;
    }
    setStatus("submitting");
    setErrorMessage(null);
    let needsConfirmation = false;
    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (!data || data.session === null) needsConfirmation = true;
      } else {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (caught) {
      fail(
        humanizeAuthError(
          caught instanceof Error ? caught.message : "",
        ),
      );
      return;
    }
    if (needsConfirmation) {
      setStatus("check-email");
      return;
    }
    setStatus("idle");
    router.push("/library");
    router.refresh();
  }

  if (status === "check-email") {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Check your inbox
        </h2>
        <p className="text-sm leading-relaxed text-fg/90">
          We sent a confirmation link to <span className="font-medium">{email}</span>.
          Open it, confirm your address, then come back to sign in.
        </p>
        {resendMessage ? (
          resendState === "error" ? (
            <p role="alert" className="text-sm text-rose-400">
              {resendMessage}
            </p>
          ) : (
            <p role="status" className="text-sm text-emerald-400">
              {resendMessage}
            </p>
          )
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={resending || cooldownSeconds > 0}
            className="focus-ring inline-flex items-center justify-center rounded-full border border-line bg-transparent px-5 py-2 text-sm font-medium text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending
              ? "Sending…"
              : cooldownSeconds > 0
                ? `Resend available in ${cooldownSeconds}s`
                : "Didn’t get it? Resend email"}
          </button>
          <Link
            href="/signin"
            className="focus-ring inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="auth-email" className="block text-sm font-medium text-fg">
          Email
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={submitting}
          className="focus-ring w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70 disabled:opacity-60"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="auth-password" className="block text-sm font-medium text-fg">
          Password
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder={isSignUp ? "At least 6 characters" : "Your password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={submitting}
          className="focus-ring w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70 disabled:opacity-60"
        />
      </div>
      {status === "error" && errorMessage ? (
        <p role="alert" className="text-sm text-rose-400">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="focus-ring inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-2.5 font-medium text-[#04121a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Working…" : isSignUp ? "Create account" : "Sign in"}
      </button>
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-widest text-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {OAUTH_PROVIDERS.map(({ provider, label }) => (
          <button
            key={provider}
            type="button"
            disabled
            title="Configure this provider in the Supabase dashboard"
            onClick={() => void handleOAuth(provider)}
            className="focus-ring flex-1 rounded-full border border-line bg-panel px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
    </form>
  );
}
