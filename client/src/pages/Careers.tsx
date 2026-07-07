/*
 * Spunkmeyers Pub & Grill - Careers Page
 * DESIGN: Cinematic Editorial - Premium employment page
 * Fonts: Oswald headlines, Lora body (global via CSS)
 * No duplicate photos - elevated layout with perks and form
 */
import { useState, useEffect, useRef } from "react";
import { IMAGES } from "@/lib/constants";
import SEO, { breadcrumbSchema } from "@/components/SEO";
import FormSuccess from "@/components/FormSuccess";

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>(".fade-up");
    if (!els || els.length === 0) return;
    const check = () => {
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 30) el.classList.add("visible");
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    const fallback = setTimeout(() => els.forEach((el) => el.classList.add("visible")), 1000);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener("scroll", check);
    };
  }, []);
  return ref;
}

export default function Careers() {
  const fadeRef = useFadeUp();

  return (
    <div ref={fadeRef} className="min-h-screen bg-[#1a1a1a]">
      <SEO
        title="Careers | Spunkmeyers Pub & Grill - Now Hiring in Wadsworth, OH"
        description="Join the Spunkmeyers Pub & Grill team in Wadsworth, OH. Now hiring bartenders, servers, and kitchen staff. Apply online today."
        path="/careers"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/unnamed(8)_ddd8bb98.webp"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Careers", url: "https://spunkmeyers.pub/careers" }
        ])}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Image area - shows the full team photo */}
        <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh]">
          <img
            src={IMAGES.staffThree}
            alt="Spunkmeyers team members"
            className="w-full h-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#1a1a1a]" />
        </div>
        {/* Text overlay at the bottom, sitting on the dark fade */}
        <div className="relative -mt-24 sm:-mt-28 z-10 text-center px-4 pb-8 sm:pb-12">
          <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
            We're Hiring
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
            Join the Family
          </h1>
          <p className="text-lg sm:text-xl text-[#F5F0EB]/80 max-w-xl mx-auto drop-shadow-md">
            Great people. Great food. A place you'll actually want to work.
          </p>
        </div>
      </section>

      {/* Perks & Application */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0EB] mb-4 tracking-tight">
              Why Work at Spunkmeyers?
            </h2>
            <div className="w-16 h-[3px] bg-[#E8601C] mx-auto" />
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 sm:mb-20">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
                title: "Great Team",
                desc: "Work alongside people who actually like being here."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Flexible Hours",
                desc: "Days, nights, weekends. We'll work with your schedule."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                ),
                title: "Competitive Pay",
                desc: "Good tips, fair wages, and room to grow."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                ),
                title: "Fun Environment",
                desc: "Bingo nights, live music, game days. Never a dull shift."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
                  </svg>
                ),
                title: "Staff Meals",
                desc: "Eat well on shift. You know the food is good."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
                title: "No Experience Needed",
                desc: "We'll train you. Attitude matters more than a resume."
              },
            ].map((perk, i) => (
              <div
                key={i}
                className="perk-card fade-up"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="text-[#E8601C] mb-4">
                  {perk.icon}
                </div>
                <h3 className="font-heading text-lg text-[#F5F0EB] mb-2">{perk.title}</h3>
                <p className="text-[#999] text-sm leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>

          {/* Application Form */}
          <div className="fade-up">
            <ApplicationForm />
          </div>
        </div>
      </section>

      {/* Bottom spacer for mobile sticky button */}
      <div className="h-20 bg-[#1a1a1a] lg:hidden" />
    </div>
  );
}

function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasExperience, setHasExperience] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const firstName = ((formData.get("fullName") as string) || "there").split(" ")[0];
    setUserName(firstName);

    const body = new URLSearchParams();
    body.append("form-name", "careers");
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
        setError("Something went wrong. Please try again or call us at (330) 334-5080.");
      }
    } catch {
      setError("Something went wrong. Please try again or call us at (330) 334-5080.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <FormSuccess
        heading={`Thanks, ${userName}!`}
        lines={[
          "We got your application and appreciate the interest.",
          "If there's a fit, someone from the Spunkmeyers team will reach out soon.",
        ]}
        className="p-10 sm:p-16"
      />
    );
  }

  return (
    <div className="relative">
      {/* Form header */}
      <div className="bg-gradient-to-r from-[#E8601C] to-[#d4540f] p-6 sm:p-8">
        <h2 className="font-heading text-2xl sm:text-3xl text-white tracking-tight">
          Employment Application
        </h2>
        <p className="text-white/80 text-base mt-2">
          Fill it out. We'll reach out if there's a fit.
        </p>
      </div>

      {/* Form body */}
      <form
        name="careers"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="bg-[#181818] border border-white/5 border-t-0 p-6 sm:p-10 space-y-6"
      >
        <input type="hidden" name="form-name" value="careers" />
        <p hidden>
          <label>Don't fill this out if you're human: <input name="bot-field" /></label>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Full Name *</label>
            <input type="text" name="fullName" required className="form-input" placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Email Address *</label>
            <input type="email" name="email" required className="form-input" placeholder="your@email.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Phone Number *</label>
            <input type="tel" name="phone" required className="form-input" placeholder="(330) 555-1234" />
          </div>
          <div>
            <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Position Applying For</label>
            <select name="position" className="form-input" defaultValue="">
              <option value="" disabled>Select a position</option>
              <option value="bartender">Bartender</option>
              <option value="server">Server</option>
              <option value="kitchen">Kitchen Staff</option>
              <option value="host">Host</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-3">Availability</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center gap-2 text-[#999] text-sm cursor-pointer hover:text-[#F5F0EB] transition-colors">
                <input
                  type="checkbox"
                  name="availability"
                  value={day}
                  className="w-4 h-4 rounded border-white/20 bg-[#333] text-[#E8601C] focus:ring-[#E8601C] focus:ring-offset-0 accent-[#E8601C]"
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Hours Available</label>
          <select name="hoursAvailable" className="form-input" defaultValue="">
            <option value="" disabled>Select availability</option>
            <option value="days">Days</option>
            <option value="nights">Nights</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-3">
            Previous restaurant or bar experience?
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-[#999] text-sm cursor-pointer hover:text-[#F5F0EB] transition-colors">
              <input
                type="radio"
                name="experience"
                value="yes"
                onChange={() => setHasExperience(true)}
                className="w-4 h-4 border-white/20 bg-[#333] text-[#E8601C] focus:ring-[#E8601C] accent-[#E8601C]"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-[#999] text-sm cursor-pointer hover:text-[#F5F0EB] transition-colors">
              <input
                type="radio"
                name="experience"
                value="no"
                onChange={() => setHasExperience(false)}
                className="w-4 h-4 border-white/20 bg-[#333] text-[#E8601C] focus:ring-[#E8601C] accent-[#E8601C]"
              />
              No
            </label>
          </div>
        </div>

        {hasExperience && (
          <div>
            <label className="block text-[#F5F0EB] text-sm font-medium mb-2">
              Briefly describe your experience
            </label>
            <textarea
              name="experienceDesc"
              rows={3}
              className="form-input resize-none"
              placeholder="Where and what role..."
            />
          </div>
        )}

        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-2">
            Why Spunkmeyers?
          </label>
          <textarea
            name="whySpunkmeyers"
            rows={3}
            className="form-input resize-none"
            placeholder="What draws you here?"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-premium w-full sm:w-auto text-base py-4 px-10 disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
