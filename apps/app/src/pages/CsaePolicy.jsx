import "../styles/privacy.scss";
import { ReportForm } from "../components/common";

const CsaePolicy = () => {
  return (
    <div className="privacy">
      <h1 className="privacy__title">
        Child Sexual Abuse & Exploitation Policy
      </h1>
      <p>Last updated: October 8, 2025</p>

      <section>
        <h2>Our Commitment</h2>
        <p>
          TriggerFeed strictly prohibits any content that sexualizes or exploits
          children. We do not allow images, videos, text, or other media that
          depict or promote child sexual abuse or exploitation. Any such
          material is banned and will be removed immediately.
        </p>
      </section>

      <section>
        <h2>What we do</h2>
        <ul>
          <li>We remove reported CSAE content immediately upon verification.</li>
          <li>
            We preserve relevant metadata and evidence for law enforcement
            requests.
          </li>
          <li>
            We cooperate with law enforcement and will provide account and
            content data when legally required.
          </li>
          <li>
            We apply automated and human moderation to detect and block CSAE
            material.
          </li>
        </ul>
      </section>

      <section id="report-csae">
        <h2>How to report</h2>
        <p>
          If you encounter content that may involve CSAE, please report it as
          soon as possible. Provide the post URL, the username (if known), and
          any relevant context.
        </p>
        <p>
          You can contact us directly at{" "}
          <a href="mailto:abuse@triggerfeed.com">abuse@triggerfeed.com</a> or
          submit the secure report form below. Reports are routed directly to
          our trust &amp; safety team and logged for law enforcement review.
        </p>
      </section>

      <section>
        <h2>What happens after a report</h2>
        <ol>
          <li>
            We perform an immediate review and remove confirmed CSAE content.
          </li>
          <li>
            We preserve evidence (content, timestamps, IPs) and will escalate to
            law enforcement if applicable.
          </li>
          <li>
            We may suspend or ban accounts that upload or share CSAE content.
          </li>
        </ol>
      </section>

      <section>
        <h2>Legal and contact</h2>
        <p>
          For urgent matters, contact local law enforcement immediately and then
          notify us at{" "}
          <a href="mailto:abuse@triggerfeed.com">abuse@triggerfeed.com</a>. We
          will cooperate with all lawful requests for information.
        </p>
      </section>

      <section aria-labelledby="csae-report-form">
        <h2 id="csae-report-form">Submit a CSAE report</h2>
        <ReportForm />
      </section>
    </div>
  );
};

export default CsaePolicy;
