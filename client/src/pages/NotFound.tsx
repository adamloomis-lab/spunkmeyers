import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <SEO
        title="Page Not Found | Spunkmeyers Pub & Grill"
        description="The page you're looking for can't be found."
        path="/404"
        noindex
      />
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-[#E8601C] mb-4 font-heading">
          404
        </h1>
        <p className="text-[#F5F0EB] text-xl mb-2 font-heading uppercase tracking-wider">
          Page Not Found
        </p>
        <p className="text-[#999] mb-8">
          Looks like this page wandered off. Let's get you back to the bar.
        </p>
        <Link href="/" className="btn-premium">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
