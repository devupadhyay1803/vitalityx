"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-[var(--vx-cream)]/20 mt-32 relative overflow-hidden">
      {/* Decorative gradient blur in footer background */}
      <div className="absolute -left-20 -bottom-20 pointer-events-none h-80 w-80 rounded-full bg-[var(--vx-jade)]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-5 md:grid-cols-2">
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
              <span className="inline-block h-6 w-6 rounded-full bg-[var(--vx-jade)] shadow-md shadow-[var(--vx-jade)]/20" />
              VitalityX
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Precision longevity health platform. Measured, coached, and compounded. We decode your biology to guide you toward your optimal biological age.
            </p>
            {/* Social Icons (Custom Inline SVGs) */}
            <div className="flex gap-4 pt-2">
              <a href="#" aria-label="Twitter" className="p-2 bg-muted/40 hover:bg-muted border border-border/50 rounded-full text-muted-foreground hover:text-foreground transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="p-2 bg-muted/40 hover:bg-muted border border-border/50 rounded-full text-muted-foreground hover:text-foreground transition-all">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="p-2 bg-muted/40 hover:bg-muted border border-border/50 rounded-full text-muted-foreground hover:text-foreground transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links columns */}
          <FooterCol title="Platform" links={[
            { href: "/programs", label: "Programs" },
            { href: "/genetics", label: "Genetics" },
            { href: "/labs", label: "Labs" },
            { href: "/products", label: "Store" },
            { href: "/signup", label: "Get Started" },
          ]} />
          
          <FooterCol title="Resources" links={[
            { href: "/help", label: "Help & FAQ" },
            { href: "/contact", label: "Contact Us" },
            { href: "/gina", label: "GINA Protection" },
            { href: "/login", label: "Member Login" },
          ]} />

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold tracking-wider uppercase text-foreground">Newsletter</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Subscribe to receive curated research briefs on longevity, biomarker optimization, and precision health.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center mt-2">
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="vx-input pr-10 text-xs w-full h-10 bg-muted/30 border-border/60 focus:border-[var(--vx-jade)]"
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--vx-ink)] hover:bg-black/90 text-white rounded-lg transition-all"
              >
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border/50 pt-8 text-xs text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} VitalityX Health, Inc. Not a medical service.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/gina" className="hover:text-foreground transition-colors">Genetic Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="space-y-4">
      <h4 className="font-display text-sm font-semibold tracking-wider uppercase text-foreground">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
