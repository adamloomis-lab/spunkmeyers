import { useState } from "react";
import FormSuccess from "@/components/FormSuccess";

/**
 * "Reserve for the Game" — large-group / game-day / patio table requests.
 * Submits to the Netlify form named "reserve" (static copy in index.html).
 * It's a request, not a confirmed booking; the success copy says so.
 */
export default function ReserveForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    setUserName(((formData.get("name") as string) || "there").split(" ")[0]);

    const body = new URLSearchParams();
    body.append("form-name", "reserve");
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
        setError("Something went wrong. Please call us at (330) 334-5080 and we'll set you up.");
      }
    } catch {
      setError("Something went wrong. Please call us at (330) 334-5080 and we'll set you up.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <FormSuccess
        heading={`You're on the list, ${userName}!`}
        lines={[
          "We got your request and we'll call or text to confirm your spot.",
          "Heads up: this is a request, not a confirmed reservation — we'll lock it in when we reach you.",
        ]}
      />
    );
  }

  return (
    <form
      name="reserve"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <input type="hidden" name="form-name" value="reserve" />
      <p hidden>
        <label>Don't fill this out if you're human: <input name="bot-field" /></label>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Name *</label>
          <input type="text" name="name" required className="form-input" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Phone *</label>
          <input type="tel" name="phone" required className="form-input" placeholder="(330) 555-1234" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Party Size *</label>
          <select name="partySize" required className="form-input" defaultValue="">
            <option value="" disabled>How many?</option>
            <option value="4-6">4&ndash;6</option>
            <option value="7-10">7&ndash;10</option>
            <option value="11-15">11&ndash;15</option>
            <option value="16+">16+</option>
          </select>
        </div>
        <div>
          <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Date *</label>
          <input type="date" name="date" required className="form-input" />
        </div>
      </div>
      <div>
        <label className="block text-[#F5F0EB] text-sm font-medium mb-2">What's the occasion?</label>
        <input
          type="text"
          name="occasion"
          className="form-input"
          placeholder="Browns game, birthday, Patio Palooza..."
        />
      </div>
      <div>
        <label className="block text-[#F5F0EB] text-sm font-medium mb-2">Anything else?</label>
        <textarea
          name="notes"
          rows={3}
          className="form-input resize-none"
          placeholder="Patio preferred, near the screens, etc."
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-premium w-full sm:w-auto disabled:opacity-50">
        {submitting ? "Sending..." : "Request a Spot"}
      </button>
    </form>
  );
}
