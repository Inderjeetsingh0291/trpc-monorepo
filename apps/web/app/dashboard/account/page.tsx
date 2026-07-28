import { AccountClient } from "./account-client";

export default function AccountPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] w-full flex-col items-center py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-geist-sans)" }}>Account Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your profile, email, and security settings.</p>
      </div>
      <AccountClient />
    </div>
  );
}
