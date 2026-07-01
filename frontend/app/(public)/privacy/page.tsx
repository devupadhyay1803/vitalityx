export default function PrivacyPage() {
 return (
 <article data-testid="legal-privacy" className="mx-auto max-w-3xl px-6 py-16">
 <p className="text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
 <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Privacy Policy</h1>
 <p className="mt-3 text-sm text-muted-foreground">Last updated: January 2026 · Version 1.0</p>

 <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
 <Section title="What we collect">
 Account details (name, email), self-reported intake responses, biomarker values uploaded by you or your assigned lab partner, optional genetic data, daily check-in metrics, messages exchanged with your coach, and order history.
 </Section>
 <Section title="Why we collect it">
 To personalize your protocol, enable your coach to advise you, fulfill supplement orders, and improve VitalityX safely. We never sell personal data.
 </Section>
 <Section title="Who sees your data">
 You, your assigned coach, and a limited number of named operations staff under audit logging. Genetic data is additionally fenced under our GINA Protection Policy.
 </Section>
 <Section title="Where we store it">
 On encrypted Supabase Postgres in the United States. Lab PDFs are stored in Supabase Storage with row-level access controls.
 </Section>
 <Section title="How long we keep it">
 For the life of your account, plus up to 30 days after closure for export purposes. Aggregated anonymous data may be retained indefinitely.
 </Section>
 <Section title="Your rights">
 You may export, correct, or delete your data at any time from <a href="/member/settings" className="underline">Settings</a>. Email <a href="mailto:privacy@vitalityx.com" className="underline">privacy@vitalityx.com</a> for additional requests.
 </Section>
 <Section title="Cookies">
 We use only essential cookies for authentication. No third-party advertising trackers.
 </Section>
 </div>
 </article>
 );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
 return (
 <section>
 <h2 className="font-display text-2xl font-medium">{title}</h2>
 <p className="mt-2 text-muted-foreground">{children}</p>
 </section>
 );
}
