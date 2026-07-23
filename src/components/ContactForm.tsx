import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { Send } from "lucide-react";
import { Button } from "./Button";

type Status = "idle" | "sending" | "success" | "error" | "not-configured";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    if (!isEmailConfigured) {
      setStatus("not-configured");
      return;
    }

    setStatus("sending");
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY);
      setStatus("success");
      formRef.current.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
          Name
          <input
            name="from_name"
            type="text"
            required
            className="rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500"
            placeholder="Jane Smith"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
          Email
          <input
            name="reply_to"
            type="email"
            required
            className="rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500"
            placeholder="jane@email.com"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
        Phone (optional)
        <input
          name="phone"
          type="tel"
          className="rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500"
          placeholder="(555) 010-2938"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
        Project Details
        <textarea
          name="message"
          required
          rows={5}
          className="resize-none rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500"
          placeholder="Tell us about your project -- scope, timeline, and budget range."
        />
      </label>

      <Button type="submit" size="lg" disabled={status === "sending"} className="w-fit disabled:opacity-60">
        {status === "sending" ? "Sending..." : "Send Message"}
        <Send className="h-4 w-4" />
      </Button>

      {status === "success" && <p className="text-sm font-semibold text-green-700">Thanks -- your message has been sent. We'll be in touch soon.</p>}
      {status === "error" && <p className="text-sm font-semibold text-red-700">Something went wrong sending your message. Please try again or call us directly.</p>}
      {status === "not-configured" && (
        <p className="text-sm font-semibold text-amber-600">
          The contact form isn't connected to an email service yet. Set VITE_EMAILJS_* in .env to enable it.
        </p>
      )}
    </form>
  );
}
