import { Link } from "wouter";
import { BUSINESS } from "@/lib/constants";
import SEO, { breadcrumbSchema } from "@/components/SEO";
import LegalLayout from "@/components/LegalLayout";

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Use | Spunkmeyers Pub & Grill"
        description="The terms and conditions for using the Spunkmeyers Pub & Grill website in Wadsworth, OH."
        path="/terms"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Terms of Use", url: "https://spunkmeyers.pub/terms" },
        ])}
      />
      <LegalLayout
        title="Terms of Use"
        lastUpdated="May 20, 2026"
        intro="Welcome to the Spunkmeyers Pub & Grill website. By accessing or using this site, you agree to these Terms of Use. If you do not agree, please do not use the site."
      >
        <h2>Use of the Site</h2>
        <p>
          You may use this website for lawful, personal, and non-commercial purposes only. You agree
          not to misuse the site, interfere with its operation, attempt to access it in an
          unauthorized way, or use it to transmit harmful or unlawful content.
        </p>

        <h2>Age Requirement</h2>
        <p>
          Spunkmeyers Pub & Grill serves alcohol. You must be of legal drinking age (21 or older in
          Ohio) to purchase or consume alcoholic beverages. We support responsible service and
          enjoyment of alcohol.
        </p>

        <h2>Accuracy of Information</h2>
        <p>
          We work to keep menu items, prices, hours, events, and other details accurate and current,
          but they are subject to change without notice. We do not guarantee that all information on
          the site is complete or error-free. Please call us at{" "}
          <a href={BUSINESS.phoneLink}>{BUSINESS.phone}</a> to confirm current details.
        </p>

        <h2>Online Ordering & Third-Party Services</h2>
        <p>
          Our website links to third-party services such as DoorDash for online ordering and Google
          Maps for directions. We do not control these services, and your use of them is governed by
          their own terms and policies. We are not responsible for transactions you make through
          third-party platforms.
        </p>

        <h2>Submissions</h2>
        <p>
          When you submit information through our contact or careers forms, you agree that the
          information is accurate and that you have the right to share it. Please do not submit
          sensitive personal information (such as financial or government ID numbers) through these
          forms.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The content on this site &mdash; including text, logos, photographs, and design &mdash; is
          owned by or licensed to Spunkmeyers Pub & Grill and is protected by applicable laws. You
          may not copy, reproduce, or reuse it without our permission.
        </p>

        <h2>Disclaimer of Warranties</h2>
        <p>
          This website is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
          warranties of any kind, whether express or implied. We do not warrant that the site will be
          uninterrupted, secure, or error-free.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Spunkmeyers Pub & Grill is not liable for any
          indirect, incidental, or consequential damages arising from your use of this website.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms are governed by the laws of the State of Ohio, without regard to its conflict
          of law provisions.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the site after changes are
          posted means you accept the updated Terms.
        </p>

        <h2>Contact Us</h2>
        <p>
          Questions about these Terms? Reach us at {BUSINESS.address}, call{" "}
          <a href={BUSINESS.phoneLink}>{BUSINESS.phone}</a>, or use our{" "}
          <Link href="/contact">contact form</Link>.
        </p>
      </LegalLayout>
    </>
  );
}
