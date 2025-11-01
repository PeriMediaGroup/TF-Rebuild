'use client';

import { useMemo, useState } from "react";

import styles from "./StartupGuard.module.css";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/config/runtimeConfig";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const SUPPORT_EMAIL = "abuse@triggerfeed.com";

const buildMailto = () => {
  const subject = encodeURIComponent(
    "TriggerFeed web: missing runtime configuration"
  );
  const body = encodeURIComponent(
    [
      "Hi team,",
      "",
      "The web app launched without the required Supabase configuration.",
      "Please double check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for this build.",
      "",
      "Thanks.",
    ].join("\n")
  );

  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
};

export default function StartupGuard({ children }) {
  const [devBypass, setDevBypass] = useState(false);

  const configurationState = useMemo(
    () => ({
      url: Boolean(SUPABASE_URL),
      anonKey: Boolean(SUPABASE_ANON_KEY),
    }),
    []
  );

  const configured = isSupabaseConfigured() || devBypass;
  const showDevBypass = process.env.NODE_ENV !== "production";

  if (configured) {
    return children;
  }

  return (
    <div className={styles.guard}>
      <div className={styles.panel}>
        <h1 className={styles.title}>App configuration error</h1>
        <p className={styles.subtitle}>
          The TriggerFeed app needs runtime Supabase credentials before it can
          continue. Please supply the missing environment variables and rebuild
          the app.
        </p>

        <div className={styles.runtimeGrid}>
          <div className={styles.runtimeItem}>
            <span className={styles.runtimeLabel}>
              NEXT_PUBLIC_SUPABASE_URL
            </span>
            <span
              className={`${styles.runtimeStatus} ${
                configurationState.url
                  ? styles.statusPresent
                  : styles.statusMissing
              }`}
            >
              {configurationState.url ? "Present" : "Missing"}
            </span>
          </div>
          <div className={styles.runtimeItem}>
            <span className={styles.runtimeLabel}>
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </span>
            <span
              className={`${styles.runtimeStatus} ${
                configurationState.anonKey
                  ? styles.statusPresent
                  : styles.statusMissing
              }`}
            >
              {configurationState.anonKey ? "Present" : "Missing"}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <a className={styles.primaryAction} href={buildMailto()}>
            Email support ({SUPPORT_EMAIL})
          </a>
          {showDevBypass && (
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => setDevBypass(true)}
            >
              Continue anyway (dev only)
            </button>
          )}
        </div>

        <p className={styles.note}>
          Supply these values in a <code>.env.local</code> file or in your
          deployment provider&apos;s environment configuration, then restart the
          dev server. The guard mirrors the behavior of the native V3 client so
          web users see consistent messaging when configuration is missing.
        </p>
      </div>
    </div>
  );
}

