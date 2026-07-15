import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] w-full flex-col items-center justify-center py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-geist-sans)" }}>Account Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your profile, email, and security settings.</p>
      </div>
      <UserProfile 
        path="/dashboard/account" 
        routing="path" 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border border-slate-200 rounded-2xl",
            headerTitle: "text-slate-900 font-bold",
            headerSubtitle: "text-slate-500",
            profileSectionTitleText: "text-slate-900 font-semibold",
            formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white shadow-sm",
            badge: "bg-orange-100 text-orange-700",
          }
        }}
      />
    </div>
  );
}
