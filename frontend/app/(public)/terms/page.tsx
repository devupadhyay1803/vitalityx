export default function TermsPage() {
  return (
    <article data-testid="legal-terms" className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
      <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: January 2026 · Version 1.0</p>

      <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-[15px] leading-relaxed">
        <Section title="1. Acceptance of Terms">
          By accessing VitalityX Health, you agree to be bound by these Terms. If you do not agree, you may not use the service. Continued use after updates constitutes acceptance of the revised Terms.
        </Section>
        <Section title="2. Service Description">
          VitalityX provides personalized longevity coaching, including biomarker review, protocol guidance, and supplement recommendations. <strong>VitalityX is not a medical service.</strong> No information provided through this platform constitutes a diagnosis, treatment, or prescription.
        </Section>
        <Section title="3. Eligibility">
          You must be 18 or older and legally able to enter into binding contracts in your jurisdiction.
        </Section>
        <Section title="4. Account & Security">
          You are responsible for safeguarding your credentials. Notify us immediately of any unauthorized use. We may suspend accounts that violate these terms.
        </Section>
        <Section title="5. Health Data & Consent">
          Health data you provide is governed by our Privacy Policy and processed only with your consent recorded in your Client Record. Genetic data is additionally protected by GINA.
        </Section>
        <Section title="6. Subscriptions & Payments">
          Supplement subscriptions are billed monthly via Stripe. You may pause or cancel at any time in your portal; cancellation takes effect at the end of the current billing cycle.
        </Section>
        <Section title="7. Refunds">
          Unopened, unshipped orders are refundable within 14 days. Coaching sessions are non-refundable once delivered.
        </Section>
        <Section title="8. Intellectual Property">
          All VitalityX content, software, and protocols are © VitalityX Health. You may not reproduce or redistribute without written consent.
        </Section>
        <Section title="9. Limitation of Liability">
          VitalityX&apos;s aggregate liability is capped at the greater of $100 or the amount you paid in the 12 months preceding the claim.
        </Section>
        <Section title="10. Governing Law">
          These Terms are governed by the laws of the State of Delaware, United States.
        </Section>
        <Section title="11. Contact">
          Questions? Email <a href="mailto:legal@vitalityx.com" className="underline">legal@vitalityx.com</a>.
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
