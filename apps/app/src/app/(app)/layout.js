import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: "TriggerFeed",
};

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}

