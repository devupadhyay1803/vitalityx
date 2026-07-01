import { ContactForm } from "@/components/public/contact-form";

export const metadata = {
 title: "Contact Us — VitalityX",
 description: "Get in touch with the VitalityX clinical team.",
};

export default function ContactPage() {
 return (
 <main className="min-h-screen pt-24 pb-24" data-testid="contact-page">
 <div className="mx-auto max-w-5xl px-6">
 <p className="text-xs uppercase tracking-widest text-muted-foreground">Get In Touch</p>
 <h1 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
 Contact Our Clinical Team
 </h1>
 <p className="mt-4 max-w-xl text-muted-foreground">
 Have questions about our programs, your biological data, or a bespoke protocol? We're here to help.
 </p>

 <div className="mt-10 grid gap-10 md:grid-cols-2">
 <ContactForm />
 <div className="space-y-5">
 <h3 className="font-display text-xl">Contact Information</h3>
 <InfoBlock title="Email Support" lines={["care@vitalityx.health"]} />
 <InfoBlock title="Phone" lines={["+1 (800) 555-0199"]} />
 <InfoBlock title="Office Address" lines={["100 Precision Way, Suite 400", "San Francisco, CA 94105"]} />
 <InfoBlock title="Business Hours" lines={["Mon – Fri: 8:00 AM – 6:00 PM (PST)", "Sat – Sun: Clinical Support Only"]} />
 <p className="text-xs text-muted-foreground pt-4 border-t border-border">San Francisco HQ</p>
 </div>
 </div>
 </div>
 </main>
 );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
 return (
 <div className="vx-card p-6 vx-card shadow-sm ">
 <p className="text-xs uppercase tracking-widest text-[var(--vx-jade)] font-medium mb-2">{title}</p>
 {lines.map((l) => (
 <p key={l} className="mt-1 text-sm text-foreground">{l}</p>
 ))}
 </div>
 );
}
