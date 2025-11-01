import Link from "next/link";

import styles from "./auth-layout.module.css";

export const metadata = {
  title: "TriggerFeed — Authenticate",
};

export default function AuthLayout({ children }) {
  return (
    <div className={styles.layout}>
      <div className={styles.panel}>
        <Link href="/" className={styles.logo}>
          TriggerFeed
        </Link>
        {children}
      </div>
    </div>
  );
}

