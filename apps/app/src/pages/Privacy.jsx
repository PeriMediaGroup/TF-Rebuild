import "../styles/privacy.scss";

const PrivacyPolicy = () => {
  return (
    <div className="privacy">
      <h1 className="privacy__title">Privacy Policy</h1>
      <p>Last updated: March 31, 2025</p>
      <p>
        TriggerFeed (“we,” “our,” or “us”) is committed to protecting your
        privacy. This Privacy Policy explains how we collect, use, and protect
        your personal information when you use our website and services.
      </p>

      <h2 className="privacy__heading">1. Information We Collect</h2>
      <p>
        We collect the following information when you sign up or log in to
        TriggerFeed:
      </p>
      <ul>
        <li>Email address</li>
        <li>Display name</li>
        <li>Profile photo (if available)</li>
        <li>Location data (if manually provided in your profile)</li>
      </ul>

      <h2 className="privacy__heading">2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Authenticate your account</li>
        <li>Display your profile content</li>
        <li>
          Enable social features like posts, comments, and friend connections
        </li>
        <li>Improve and personalize your experience</li>
      </ul>

      <h2 className="privacy__heading">3. Sharing Your Data</h2>
      <p>
        We do not sell or share your personal information with third parties
        except:
      </p>
      <ul>
        <li>To comply with legal obligations</li>
        <li>To prevent fraud or abuse</li>
        <li>When you give us explicit permission</li>
      </ul>

      <h2 className="privacy__heading">4. Google Login & OAuth</h2>
      <p>
        If you sign in with Google, we collect your basic profile info (name,
        email, profile photo) in compliance with Google’s API Services User Data
        Policy. We use this data only for identity verification and account
        personalization.
      </p>

      <h2 className="privacy__heading">5. Data Retention</h2>
      <p>
        You may delete your account at any time. Upon deletion, your data will
        be removed from our systems within 30 days unless required for legal or
        security purposes.
      </p>

      <h2 className="privacy__heading">6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access and update your personal data</li>
        <li>Delete your account and associated data</li>
        <li>Contact us with questions or concerns</li>
      </ul>

      <h2 className="privacy__heading">7. Camera use</h2>
      <p>
        TriggerFeed uses the device camera solely for user-initiated photo or
        video uploads. No biometric, facial, or location data is collected,
        stored, or shared.
      </p>

      <h2 className="privacy__heading">8. Child Safety & CSAE Reporting</h2>
      <p>
        TriggerFeed maintains a zero-tolerance policy for child sexual abuse and
        exploitation (CSAE) material. We monitor, investigate, and remove
        offending content and accounts and cooperate with law enforcement. If
        you encounter suspicious content, please review our{" "}
        <a href="/csae">Child Sexual Abuse &amp; Exploitation Policy</a> to
        submit a report directly to our trust &amp; safety team.
      </p>

      <h2 className="privacy__heading">9. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at:
        <br />
        <strong>
          <a href="mailto:privacy@triggerfeed.com">privacy@triggerfeed.com</a>
        </strong>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
