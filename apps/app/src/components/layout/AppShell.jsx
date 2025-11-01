'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./AppShell.module.css";

import { useAuth } from "@/providers";

const NAV_LINKS = [
  { href: "/", label: "Feed" },
  { href: "/create", label: "Create", requireAuth: true },
  { href: "/profile", label: "Profile", requireAuth: true },
  { href: "/notifications", label: "Notifications", requireAuth: true },
  { href: "/admin", label: "Admin", requireAuth: true, requireElevated: true },
];

const isActivePath = (pathname, href) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { user, profile, isElevated, logOut, loading } = useAuth();

  const navigation = NAV_LINKS.filter((link) => {
    if (link.requireAuth && !user) return false;
    if (link.requireElevated && !isElevated) return false;
    return true;
  });

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <span>Trigger</span>Feed
          </Link>

          <nav className={styles.nav} aria-label="Primary navigation">
            {navigation.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${
                  isActivePath(pathname, href) ? styles.navLinkActive : ""
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className={`${styles.authButton} ${styles.authButtonGhost}`}
                >
                  @{profile?.username ?? user.email?.split("@")[0] ?? "profile"}
                </Link>
                <button
                  type="button"
                  className={`${styles.authButton} ${styles.authButtonPrimary}`}
                  onClick={logOut}
                  disabled={loading}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${styles.authButton} ${styles.authButtonGhost}`}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={`${styles.authButton} ${styles.authButtonPrimary}`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} TriggerFeed. All rights reserved.
      </footer>
    </div>
  );
}
