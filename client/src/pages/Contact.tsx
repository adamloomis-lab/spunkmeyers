/*
 * DESIGN: Cinematic Editorial - Dark magazine spread
 * Contact page with form, map, hours (current day highlighted)
 * Fonts: Oswald headlines, Lora body (global via CSS)
 */
import { useState } from "react";
import { IMAGES, BUSINESS, getCurrentDayName } from "@/lib/constants";
import { Link } from "wouter";
import SEO, { breadcrumbSchema } from "@/components/SEO";
import FormSuccess from "@/components/FormSuccess";

export default function Contact() {
  const today = getCurrentDayName();

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <SEO
        title="Contact | Spunkmeyers Pub & Grill - Hours, Location, Directions"
        description="Contact Spunkmeyers Pub & Grill at 993 High St, Wadsworth, OH 44281. Call (330) 334-5080. Open daily for lunch and dinner. View hours, get directions, or send us a message."
        path="/contact"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/505866671_1225941609430453_2401601335831511267_n_b7359eac.jpg"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Contact", url: "https://spunkmeyers.pub/contact" }
        ])}
      />
      {/* Hero */}
      <section className="relative h-[35vh] sm:h-[50vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.storefront})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#1a1a1a]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
            Get In Touch
          </h1>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
            {/* Info + Map */}
            <div>
              <div className="mb-10">
                <h2 className="font-heading text-2xl text-[#E8601C] mb-6">Location & Hours</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#F5F0EB] text-lg font-semibold">{BUSINESS.address}</p>
                    <a
                      href={BUSINESS.phoneLink}
                      className="text-[#E8601C] text-2xl font-bold hover:text-[#F07A3A] transition-colors"
                    >
                      {BUSINESS.phone}
                    </a>
                  </div>
                  <div className="bg-[#222] border border-white/5 p-6">
                    <h3 className="font-heading text-sm text-[#E8601C] uppercase tracking-widest mb-4">Hours</h3>
                    <div className="space-y-2">
                      {BUSINESS.hours.map((h) => {
                        const isToday = h.day === today;
                        return (
                          <div
                            key={h.day}
                            className={`hours-row flex justify-between py-1 ${isToday ? "today" : ""}`}
                          >
                            <span className={`hours-day ${isToday ? "" : "text-[#999]"}`}>{h.day}</span>
                            <span className={`hours-time ${isToday ? "" : "text-[#F5F0EB] font-medium"}`}>{h.hours}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="w-full h-[300px] bg-[#222] border border-white/5">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.876475127568!2d-81.72768390000002!3d41.049830299999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8830cdcea34b6951%3A0x8011aa27530832b9!2sSpunkmeyers%20Pub%20%26%20Grill!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Spunkmeyers Pub & Grill Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-heading text-2xl text-[#E8601C] mb-6">Send Us a Message</h2>
              <p className="text-[#999] mb-8">
                Questions, event bookings, or just saying hey. Drop us a line.
              </p>
              <ContactForm />

              {/* Careers CTA */}
              <div className="mt-12 bg-[#222] border border-white/5 p-8 text-center">
                <h3 className="font-heading text-xl text-[#F5F0EB] mb-3">Want to Join the Team?</h3>
                <p className="text-[#999] text-sm mb-6">
                  Great people who love good food and taking care of others.
                </p>
                <Link href="/careers" className="btn-premium">
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom spacer for mobile sticky button */}
      <div className="h-20 bg-[#1a1a1a] lg:hidden" />
    </div>
  );
}

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    setUserName((formData.get("name") as string) || "there");

    const body = new URLSearchParams();
    body.append("form-name", "contact");
    formData.forEach((value, key) => body.append(key, value as string));

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again or call us directly.");
      }
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <FormSuccess
        heading={`Thanks, ${userName}!`}
        lines={[
          "We got your message and appreciate you reaching out.",
          "Someone from the Spunkmeyers team will get back to you soon.",
        ]}
      />
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p hidden>
        <label>Don't fill this out if you're human: <input name="bot-field" /></label>
      </p>
      <div>
        <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Name</label>
        <input type="text" name="name" required className="form-input" placeholder="Your name" />
      </div>
      <div>
        <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Email</label>
        <input type="email" name="email" required className="form-input" placeholder="your@email.com" />
      </div>
      <div>
        <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Phone</label>
        <input type="tel" name="phone" className="form-input" placeholder="(330) 555-1234" />
      </div>
      <div>
        <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Message</label>
        <textarea name="message" required rows={5} className="form-input resize-none" placeholder="How can we help?" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-premium w-full sm:w-auto disabled:opacity-50">
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
