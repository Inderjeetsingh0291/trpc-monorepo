import Link from "next/link";
import { ArrowRight, FileText, Globe, LayoutDashboard, Share2, Sparkles, UserPlus } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[oklch(1_0.005_80)]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[oklch(0.88_0.025_75)] bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.62_0.19_48)] to-[oklch(0.7_0.2_60)] shadow-md">
              <FileText className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[oklch(0.18_0.05_40)]">
              MakeForms
            </span>
            <span className="hidden md:inline-flex rounded-full bg-[oklch(0.62_0.19_48)/15%] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.62_0.19_48)]">
              Punjab Edition
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-[oklch(0.35_0.05_40)]">
            <Link href="#features" className="hover:text-[oklch(0.62_0.19_48)] transition-colors">Features</Link>
            <Link href="/dashboard/public-forms" className="hover:text-[oklch(0.62_0.19_48)] transition-colors">Explore Forms</Link>
            <Link href="/dashboard/pricing" className="hover:text-[oklch(0.62_0.19_48)] transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-[oklch(0.62_0.19_48)] transition-colors">API</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold hover:bg-[oklch(0.62_0.19_48)/10%] hover:text-[oklch(0.62_0.19_48)]">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button className="font-semibold bg-[oklch(0.62_0.19_48)] text-white hover:bg-[oklch(0.55_0.16_48)] shadow-md">
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-48">
          <div className="absolute top-0 right-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.62_0.19_48/15%),rgba(255,255,255,0))]" />
          <div className="absolute top-1/4 right-10 -z-10 size-64 rounded-full bg-[oklch(0.62_0.19_48/20%)] blur-[120px]" />
          <div className="absolute bottom-1/4 left-10 -z-10 size-72 rounded-full bg-[oklch(0.5_0.14_145/20%)] blur-[120px]" />

          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-[oklch(0.62_0.19_48/30%)] bg-[oklch(0.62_0.19_48/10%)] px-7 py-2 mb-8 backdrop-blur-md">
              <Sparkles className="size-4 text-[oklch(0.62_0.19_48)]" />
              <p className="text-sm font-semibold text-[oklch(0.62_0.19_48)]">
                Introducing Public & Unlisted Modes
              </p>
            </div>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-[oklch(0.18_0.05_40)] sm:text-6xl md:text-7xl lg:text-8xl mb-8 leading-[1.1]">
              Build powerful forms with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.62_0.19_48)] to-[oklch(0.5_0.14_145)]">spirit of Punjab.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-[oklch(0.35_0.05_40)] mb-12">
              Create dynamic forms, manage responses, and share instantly. Whether public or unlisted, MakeForms gives you the tools to gather insights securely and beautifully.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base font-bold h-14 px-8 rounded-xl bg-gradient-to-r from-[oklch(0.62_0.19_48)] to-[oklch(0.55_0.16_48)] shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                  Start Building Free
                </Button>
              </Link>
              <Link href="/dashboard/public-forms" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-bold h-14 px-8 rounded-xl border-[oklch(0.88_0.025_75)] bg-white/50 backdrop-blur-md hover:bg-white text-[oklch(0.18_0.05_40)]">
                  <Globe className="mr-2 size-5 text-[oklch(0.62_0.19_48)]" />
                  Explore Public Forms
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-[oklch(0.18_0.05_40)] mb-4">
                Everything you need to collect data
              </h2>
              <p className="text-lg text-[oklch(0.35_0.05_40)] max-w-2xl mx-auto">
                MakeForms is packed with features designed to make form creation and response management a breeze.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Visibility Modes",
                  description: "Publish forms as Public to show them in the explore gallery, or Unlisted for link-only private access.",
                  icon: Globe,
                  color: "oklch(0.62 0.19 48)",
                  bg: "oklch(0.62 0.19 48 / 10%)"
                },
                {
                  title: "Dynamic Fields",
                  description: "10+ field types including Text, Select, Rating, and Date with built-in validation and required rules.",
                  icon: LayoutDashboard,
                  color: "oklch(0.5 0.14 145)",
                  bg: "oklch(0.5 0.14 145 / 10%)"
                },
                {
                  title: "Instant Sharing",
                  description: "Generate QR codes and unique links instantly. Respondents can fill out public forms without logging in.",
                  icon: Share2,
                  color: "oklch(0.55 0.16 280)",
                  bg: "oklch(0.55 0.16 280 / 10%)"
                },
                {
                  title: "API First (Scalar)",
                  description: "Fully documented OpenAPI specs using Scalar. Integrate your form responses directly into your own apps.",
                  icon: FileText,
                  color: "oklch(0.7 0.15 75)",
                  bg: "oklch(0.7 0.15 75 / 10%)"
                },
                {
                  title: "Creator Dashboard",
                  description: "A centralized, secure space to manage all your forms, view analytics, and organize submissions.",
                  icon: LayoutDashboard,
                  color: "oklch(0.62 0.19 48)",
                  bg: "oklch(0.62 0.19 48 / 10%)"
                },
                {
                  title: "Respondent Analytics",
                  description: "View submission timelines, conversion rates, and export your data directly from the dashboard.",
                  icon: UserPlus,
                  color: "oklch(0.5 0.14 145)",
                  bg: "oklch(0.5 0.14 145 / 10%)"
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col gap-4 p-8 rounded-3xl border border-[oklch(0.88_0.025_75)] bg-[oklch(1_0.005_80)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div 
                    className="flex size-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: feature.bg, color: feature.color }}
                  >
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(0.18_0.05_40)]">{feature.title}</h3>
                  <p className="text-[oklch(0.35_0.05_40)] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.62_0.19_48)] to-[oklch(0.5_0.14_145)] opacity-95" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
          
          <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Ready to create your first form?</h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Join thousands of creators who use MakeForms to collect data, feedback, and leads effectively.
            </p>
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 rounded-xl bg-white text-[oklch(0.62_0.19_48)] hover:bg-gray-50 text-lg font-bold shadow-2xl hover:scale-105 transition-all">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-[oklch(0.88_0.025_75)] bg-white text-center">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-[oklch(0.62_0.19_48)]" />
            <span className="font-bold text-[oklch(0.18_0.05_40)]">MakeForms</span>
          </div>
          <p className="text-sm text-[oklch(0.35_0.05_40)]">
            © {new Date().getFullYear()} MakeForms (Punjab Edition). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-[oklch(0.35_0.05_40)]">
            <Link href="/docs" className="hover:text-[oklch(0.62_0.19_48)]">API Docs</Link>
            <Link href="/dashboard/pricing" className="hover:text-[oklch(0.62_0.19_48)]">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
