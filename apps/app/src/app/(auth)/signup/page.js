'use client';

import Link from "next/link";

export const metadata = {
  title: "Sign up — TriggerFeed",
};

export default function SignupPage() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <h1>Create your account</h1>
      <p>
        The signup form will connect to Supabase just like the mobile V3
        version. We&apos;ll wire it in once the shared auth utilities are ready.
      </p>
      <p>
        Already have an account? <Link href="/login">Log in</Link>.
      </p>
    </form>
  );
}

