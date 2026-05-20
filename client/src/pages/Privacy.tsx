import { Link } from "wouter";
import { BUSINESS } from "@/lib/constants";
import SEO, { breadcrumbSchema } from "@/components/SEO";
import LegalLayout from "@/components/LegalLayout";

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy | Spunkmeyers Pub & Grill"
        description="How Spunkmeyers Pub & Grill in Wadsworth, OH collects, uses, and protects the information you share through our website and forms."
        path="/privacy"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Privacy Policy", url: "https://spunkmeyers.pub/privacy" },
        ])}
      />
      <LegalLayout
        title="Privacy Policy"
        lastUpdated="May 20, 2026"
        intro="Spunkmeyers Pub & Grill (“we,” “us,” or “our”) respects your privacy. This policy explains what information we collect through this website, how we use it, and the choices you have."
      >
        <h2>Information We Collect</h2>
        <h3>Information you give us</h3>
        <p>
          When you use our contact form, we collect your name, email address, phone number, and the
          message you send. When you submit a job application through our Careers page, we collect
          your name, email address, phone number, availability, and any details you choose to share
          about your experience.
        </p>
        <h3>Information collected automatically</h3>
        <p>
          Like most websites, our hosting provider may log standard technical information such as
          your IP address, browser type, and the pages you visit, for security and to keep the site
          running. We do not use advertising trackers or sell this information.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To respond to your questions, messages, and event inquiries.</li>
          <li>To review and follow up on job applications.</li>
          <li>To operate, maintain, and improve our website.</li>
          <li>To protect against fraud, spam, and abuse.</li>
        </ul>

        <h2>How We Share Your Information</h2>
        <p>
          We do not sell or rent your personal information. We share it only with trusted service
          providers who help us operate the site &mdash; for example, our website host and form
          provider (Netlify), which processes and stores form submissions on our behalf. We may also
          disclose information if required by law.
        </p>

        <h2>Third-Party Services & Links</h2>
        <p>
          Our website includes embedded content and links to third-party services, including Google
          Maps, DoorDash, Facebook, and Instagram. These services have their own privacy policies,
          and we are not responsible for their practices. We encourage you to review the policies of
          any third-party site you visit.
        </p>

        <h2>Cookies</h2>
        <p>
          Our website itself sets little to no cookies. However, embedded third-party content (such
          as the Google Maps shown on our Contact page) may set its own cookies. You can control or
          disable cookies through your browser settings.
        </p>

        <h2>Data Retention</h2>
        <p>
          We keep form submissions only as long as needed to respond to your inquiry or evaluate your
          application, and as required for our records. You may ask us to delete information you have
          submitted at any time.
        </p>

        <h2>Your Choices</h2>
        <p>
          You can request access to, correction of, or deletion of the personal information you have
          shared with us by contacting us using the details below. You may also choose not to submit
          information through our forms.
        </p>

        <h2>Children&rsquo;s Privacy</h2>
        <p>
          Our website is intended for a general audience and is not directed to children. Because we
          serve alcohol, certain areas of our business are intended for guests 21 and older. We do
          not knowingly collect personal information from children under 13.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the
          &ldquo;Last updated&rdquo; date at the top of this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          Questions about this policy or your information? Reach us at {BUSINESS.address}, call{" "}
          <a href={BUSINESS.phoneLink}>{BUSINESS.phone}</a>, or use our{" "}
          <Link href="/contact">contact form</Link>.
        </p>
      </LegalLayout>
    </>
  );
}
