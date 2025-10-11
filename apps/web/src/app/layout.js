import "@triggerfeed/theme/scss/global.scss";
import { blackOpsOne } from "@triggerfeed/theme";
import { Header, Footer } from "@triggerfeed/theme/components";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "TriggerFeed — Firearms-Friendly Social Media",
  description: "Join the community built for firearms enthusiasts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={blackOpsOne.variable}>
        <div className="tf-page">
          <Header Navigation={Navigation} />
          <main className="tf-page__content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
