import { Link } from "wouter";
import { BUSINESS } from "@/lib/constants";
import SEO, { breadcrumbSchema } from "@/components/SEO";
import LegalLayout from "@/components/LegalLayout";

export default function Accessibility() {
  return (
    <>
      <SEO
        title="Accessibility | Spunkmeyers Pub & Grill"
        description="Spunkmeyers Pub & Grill is committed to making our website accessible to everyone. Learn about our efforts and how to request assistance."
        path="/accessibility"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Accessibility", url: "https://spunkmeyers.pub/accessibility" },
        ])}
      />
      <LegalLayout
        title="Accessibility Statement"
        lastUpdated="May 20, 2026"
        intro="Spunkmeyers Pub & Grill is committed to making our website welcoming and usable for everyone, including people with disabilities."
      >
        <h2>Our Commitment</h2>
        <p>
          We want every guest to be able to learn about our food, drinks, hours, and events online
          with ease. We are continually working to improve the accessibility and usability of our
          website for all visitors.
        </p>

        <h2>Conformance Goals</h2>
        <p>
          We aim to align our website with the Web Content Accessibility Guidelines (WCAG) 2.1 Level
          AA, the widely recognized standard for web accessibility. Accessibility is an ongoing
          effort, and we review and improve the site over time.
        </p>

        <h2>What We Do</h2>
        <ul>
          <li>Use clear text, readable fonts, and strong color contrast.</li>
          <li>Provide descriptive text alternatives for meaningful images.</li>
          <li>Support keyboard navigation and screen readers where possible.</li>
          <li>Respect the &ldquo;reduce motion&rdquo; setting for visitors who prefer less animation.</li>
          <li>Build pages to work across desktop, tablet, and mobile screens.</li>
        </ul>

        <h2>Known Limitations</h2>
        <p>
          Some content provided by third parties &mdash; such as the embedded Google Map or social
          media content &mdash; may not be fully accessible, as it is outside our direct control. If
          you run into trouble with any part of our site, please let us know and we&rsquo;ll do our
          best to help.
        </p>

        <h2>Need Help or Have Feedback?</h2>
        <p>
          If you have difficulty using any part of this website, or you&rsquo;d like information in a
          different format, we&rsquo;re happy to assist. Call us at{" "}
          <a href={BUSINESS.phoneLink}>{BUSINESS.phone}</a>, visit us at {BUSINESS.address}, or send a
          message through our <Link href="/contact">contact form</Link>. We welcome your feedback and
          will respond as quickly as we can.
        </p>
      </LegalLayout>
    </>
  );
}
