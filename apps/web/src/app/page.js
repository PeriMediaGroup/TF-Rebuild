import styles from "./page.module.css";
import { Button } from "@triggerfeed/theme";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>TriggerFeed Website</h1>
        <ol>
          <li>
            Coming soon
          </li>
          <li>Get the app</li>
        </ol>

        <InputField label="Username" placeholder="Type here..." />
        <Button variant="primary">Submit</Button>
        <Button variant="secondary">Cancel</Button>
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
