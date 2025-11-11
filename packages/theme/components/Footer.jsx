import "./footer.scss";

export default function Footer() {
  return (
    <footer className="tf-footer">
      <div className="tf-footer__content">
        <p>© {new Date().getFullYear()} TriggerFeed. All rights reserved.</p>

        <div className="tf-footer__links">
          <a href="/legal/">Legal</a>
          <a href="/contact">Contact Us</a>
          <a href="https://perimediagroup.com" target="_blank" rel="noopener noreferrer">Peri Media Group</a>
        </div>
      </div>
    </footer>
  );
}
