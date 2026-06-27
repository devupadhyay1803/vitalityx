import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-[var(--vx-cream)]/40 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-semibold">
              <span className="inline-block h-5 w-5 rounded-full bg-[var(--vx-jade)]" />
              VitalityX
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Precision longevity. Measured, coached, compounded.
            </p>
          </div>
          <FooterCol title="Platform" links={[
            { href: "/#science", label: "The Science" },
            { href: "/#protocols", label: "Protocols" },
            { href: "/#supplements", label: "Supplements" },
            { href: "/signup", label: "Get Started" },
          ]} />
          <FooterCol title="Resources" links={[
            { href: "/help", label: "Help & FAQ" },
            { href: "/gina", label: "GINA Protection" },
            { href: "/login", label: "Member Login" },
          ]} />
          <FooterCol title="Legal" links={[
            { href: "/terms", label: "Terms of Service" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/gina", label: "Genetic Privacy" },
          ]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VitalityX Health. Not a medical service.</p>
          <p className="text-xs text-muted-foreground">Built with respect for your biology.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold tracking-wide text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
