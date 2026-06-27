"use client";
import { toast } from "sonner";

export function ContactForm() {
  return (
    <form
      data-testid="contact-form"
      className="vx-card space-y-4 p-7"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Thanks — our clinical team will reply within 1 business day.");
        (e.currentTarget as HTMLFormElement).reset();
      }}
    >
      <h3 className="font-display text-xl">Send a Message</h3>
      <input className="vx-input" placeholder="Full Name *" required />
      <input className="vx-input" type="email" placeholder="Email Address *" required />
      <input className="vx-input" placeholder="Phone Number" />
      <input className="vx-input" placeholder="Subject" />
      <textarea className="vx-input" rows={4} placeholder="Message *" required />
      <button type="submit" className="btn btn-primary w-full">Send Message</button>
    </form>
  );
}
