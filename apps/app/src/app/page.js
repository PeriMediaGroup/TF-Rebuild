import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>TriggerFeed App</h1>
        <ol>
          <li>
            Coming soon
          </li>
          <li>Web Version of our application</li>
        </ol>
      </main>
      <footer className={styles.footer}>
        <footer className={styles.footer}>
          <a
            href="https://perimediagroup.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Peri Media Group
          </a>
        </footer>
      </footer>
    </div>
  );
}
