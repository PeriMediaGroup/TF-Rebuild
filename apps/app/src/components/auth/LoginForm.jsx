'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import styles from "./AuthCard.module.css";

import { signInWithEmail } from "@/lib/auth";
import { useAuth } from "@/providers";

const VALIDATION = {
  email: (value) => {
    if (!value) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email.";
    return "";
  },
  password: (value) => {
    if (!value) return "Password is required.";
    if (value.length < 6) return "Password must be at least 6 characters.";
    return "";
  },
};

export default function LoginForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect") ?? "/";
  const redirectTo = redirectParam.startsWith("/") ? redirectParam : "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, router, user]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setGeneralError("");
  };

  const validate = () => {
    const nextErrors = {};
    for (const key of Object.keys(VALIDATION)) {
      const message = VALIDATION[key](form[key]);
      if (message) nextErrors[key] = message;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isPending || !validate()) return;

    startTransition(async () => {
      setGeneralError("");
      const result = await signInWithEmail({
        email: form.email.trim(),
        password: form.password,
      });

      if (!result.success) {
        const message =
          result.error?.message ??
          "We couldn't sign you in. Double-check your credentials.";
        if (/email/i.test(message)) {
          setErrors((prev) => ({ ...prev, email: message }));
        } else if (/password/i.test(message)) {
          setErrors((prev) => ({ ...prev, password: message }));
        } else {
          setGeneralError(message);
        }
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    });
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in with your TriggerFeed credentials to continue.
        </p>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange("email")}
            className={styles.input}
            placeholder="you@example.com"
            disabled={isPending}
            required
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange("password")}
            className={styles.input}
            placeholder="••••••••"
            disabled={isPending}
            required
          />
          {errors.password && (
            <span className={styles.error}>{errors.password}</span>
          )}
        </label>
      </div>

      <div className={styles.actions}>
        {generalError && (
          <span className={styles.error}>{generalError}</span>
        )}

        <button
          type="submit"
          className={styles.submit}
          disabled={isPending}
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>

        <p className={styles.hint}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
}
