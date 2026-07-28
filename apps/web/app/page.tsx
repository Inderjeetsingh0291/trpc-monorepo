"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Globe,
  LayoutDashboard,
  Share2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect, useRef } from "react";

/* ─── Sunburst SVG ─── */
function SunburstBg({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`deco-sunburst ${className}`}
      viewBox="0 0 800 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="400"
          y1="400"
          x2={(400 + 500 * Math.cos((i * 15 * Math.PI) / 180)).toFixed(2)}
          y2={(400 + 500 * Math.sin((i * 15 * Math.PI) / 180)).toFixed(2)}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.12"
        />
      ))}
      <circle cx="400" cy="400" r="120" stroke="currentColor" strokeWidth="1.5" opacity="0.15" fill="none" />
      <circle cx="400" cy="400" r="200" stroke="currentColor" strokeWidth="1" opacity="0.1" fill="none" />
      <circle cx="400" cy="400" r="300" stroke="currentColor" strokeWidth="0.5" opacity="0.07" fill="none" />
    </svg>
  );
}

/* ─── Fan Motif SVG ─── */
function FanMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`deco-fan ${className}`}
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="100"
          x2={(100 + 95 * Math.cos(((180 + i * 22.5) * Math.PI) / 180)).toFixed(2)}
          y2={(100 + 95 * Math.sin(((180 + i * 22.5) * Math.PI) / 180)).toFixed(2)}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
        />
      ))}
      <path d="M5 100 A95 95 0 0 1 195 100" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" />
      <path d="M30 100 A70 70 0 0 1 170 100" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.25" />
    </svg>
  );
}

/* ─── Chevron Divider ─── */
function ChevronDivider() {
  return (
    <div className="deco-chevron-divider" aria-hidden="true">
      <svg viewBox="0 0 1200 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0 20 L30 5 L60 20 L90 5 L120 20 L150 5 L180 20 L210 5 L240 20 L270 5 L300 20 L330 5 L360 20 L390 5 L420 20 L450 5 L480 20 L510 5 L540 20 L570 5 L600 20 L630 5 L660 20 L690 5 L720 20 L750 5 L780 20 L810 5 L840 20 L870 5 L900 20 L930 5 L960 20 L990 5 L1020 20 L1050 5 L1080 20 L1110 5 L1140 20 L1170 5 L1200 20"
          stroke="currentColor" strokeWidth="1.5" opacity="0.4"
        />
        <path
          d="M0 28 L30 38 L60 28 L90 38 L120 28 L150 38 L180 28 L210 38 L240 28 L270 38 L300 28 L330 38 L360 28 L390 38 L420 28 L450 38 L480 28 L510 38 L540 28 L570 38 L600 28 L630 38 L660 28 L690 38 L720 28 L750 38 L780 28 L810 38 L840 28 L870 38 L900 28 L930 38 L960 28 L990 38 L1020 28 L1050 38 L1080 28 L1110 38 L1140 28 L1170 38 L1200 28"
          stroke="currentColor" strokeWidth="1.5" opacity="0.25"
        />
      </svg>
    </div>
  );
}

/* ─── Geometric Border ─── */
function GeometricBorder() {
  return (
    <div className="deco-geo-border" aria-hidden="true">
      <div className="deco-geo-border-inner" />
    </div>
  );
}

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("deco-revealed");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    // Observe all reveal targets
    root.querySelectorAll(".deco-reveal").forEach((el) => observer.observe(el));

    // Hero content is above-the-fold — force reveal immediately
    root.querySelectorAll(".deco-reveal-instant").forEach((el) => {
      el.classList.add("deco-revealed");
    });

    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Data ─── */
const features = [
  {
    title: "Visibility Modes",
    description: "Publish forms as Public to show them in the explore gallery, or Unlisted for link-only private access.",
    icon: Globe,
  },
  {
    title: "Dynamic Fields",
    description: "10+ field types including Text, Select, Rating, and Date with built-in validation and required rules.",
    icon: LayoutDashboard,
  },
  {
    title: "Instant Sharing",
    description: "Generate QR codes and unique links instantly. Respondents can fill out public forms without logging in.",
    icon: Share2,
  },
  {
    title: "API First (Scalar)",
    description: "Fully documented OpenAPI specs using Scalar. Integrate your form responses directly into your own apps.",
    icon: FileText,
  },
  {
    title: "Creator Dashboard",
    description: "A centralized, secure space to manage all your forms, view analytics, and organize submissions.",
    icon: LayoutDashboard,
  },
  {
    title: "Respondent Analytics",
    description: "View submission timelines, conversion rates, and export your data directly from the dashboard.",
    icon: UserPlus,
  },
];

const stats = [
  { value: "10K+", label: "Forms Created" },
  { value: "500K+", label: "Responses Collected" },
  { value: "99.9%", label: "Uptime Guaranteed" },
  { value: "150+", label: "Countries Served" },
];

/* ─── Page ─── */
export default function Home() {
  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef} className="deco-page">

      {/* ══════════ NAVBAR ══════════ */}
      <header className="deco-navbar">
        <div className="deco-navbar-inner">
          <div className="deco-logo-group">
            <div className="deco-logo-icon">
              <FileText className="size-5" />
            </div>
            <span className="deco-logo-text">MakeForms</span>
            <span className="deco-badge"></span>
          </div>

          <nav className="deco-nav-links">
            <Link href="#features">Features</Link>
            <Link href="/dashboard/public-forms">Explore Forms</Link>
            <Link href="/dashboard/pricing">Pricing</Link>
            <Link href="/docs">API</Link>
          </nav>

          <div className="deco-nav-actions">
            <Link href="/login">
              <Button variant="ghost" className="deco-btn-ghost">Log in</Button>
            </Link>
            <Link href="/login">
              <Button className="deco-btn-primary">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="deco-main">

        {/* ══════════ HERO ══════════ */}
        <section className="deco-hero">
          <SunburstBg />
          <div className="deco-hero-overlay" />

          {/* instant reveal — above fold */}
          <div className="deco-hero-content deco-reveal-instant deco-reveal">
            <FanMotif className="deco-hero-fan" />

            {/* <div className="deco-pill">
              <Sparkles className="size-4" />
              <span>Introducing Public &amp; Unlisted Modes</span>
            </div> */}

            <h1 className="deco-hero-title">
              Build Powerful Forms<br />
              <span className="deco-hero-accent">With Timeless Elegance.</span>
            </h1>

            <GeometricBorder />

            <p className="deco-hero-subtitle">
              Create dynamic forms, manage responses, and share instantly.
              Whether public or unlisted, MakeForms gives you the tools to
              gather insights securely and beautifully.
            </p>

            <div className="deco-hero-actions">
              <Link href="/login">
                <Button size="lg" className="deco-btn-hero-primary">
                  Start Building Free <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Link href="/dashboard/public-forms">
                <Button size="lg" variant="outline" className="deco-btn-hero-outline">
                  <Globe className="mr-2 size-5" />
                  Explore Public Forms
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <ChevronDivider />

        {/* ══════════ STATS ══════════ */}
        <section className="deco-stats">
          <div className="deco-stats-inner">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="deco-stat-item deco-reveal"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className="deco-stat-value">{stat.value}</span>
                <span className="deco-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <ChevronDivider />

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" className="deco-features">
          <div className="deco-features-inner">

            <div className="deco-section-header deco-reveal">
              <FanMotif className="deco-section-fan" />
              <h2 className="deco-section-title">Everything You Need to Collect Data</h2>
              <p className="deco-section-subtitle">
                MakeForms is packed with features designed to make form creation
                and response management a breeze.
              </p>
              <GeometricBorder />
            </div>

            <div className="deco-features-grid">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="deco-feature-card deco-reveal"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="deco-feature-icon-wrap">
                    <feature.icon className="size-7" />
                  </div>
                  {/* Corner ornaments — show on hover via CSS */}
                  <span className="deco-corner deco-corner-tl" aria-hidden="true" />
                  <span className="deco-corner deco-corner-tr" aria-hidden="true" />
                  <span className="deco-corner deco-corner-bl" aria-hidden="true" />
                  <span className="deco-corner deco-corner-br" aria-hidden="true" />
                  <h3 className="deco-feature-title">{feature.title}</h3>
                  <p className="deco-feature-desc">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ChevronDivider />

        {/* ══════════ CTA ══════════ */}
        <section className="deco-cta">
          <SunburstBg className="deco-cta-sunburst" />
          <div className="deco-cta-overlay" />

          <div className="deco-cta-content deco-reveal">
            <FanMotif className="deco-cta-fan" />
            <h2 className="deco-cta-title">Ready to Create Your First Form?</h2>
            <p className="deco-cta-subtitle">
              Join thousands of creators who use MakeForms to collect data,
              feedback, and leads effectively.
            </p>
            <Link href="/login">
              <Button size="lg" className="deco-btn-cta">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="deco-footer">
        <div className="deco-footer-inner">
          <div className="deco-footer-logo">
            <FileText className="size-5" />
            <span>MakeForms</span>
          </div>
          <p className="deco-footer-copy">
            © {new Date().getFullYear()} MakeForms — Art Deco Edition. All rights reserved.
          </p>
          <div className="deco-footer-links">
            <Link href="/docs">API Docs</Link>
            <Link href="/dashboard/pricing">Pricing</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
