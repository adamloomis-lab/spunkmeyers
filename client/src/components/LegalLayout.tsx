import type { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: ReactNode;
}

export default function LegalLayout({ title, lastUpdated, intro, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <section className="bg-[#111111] border-b border-white/5 py-16 sm:py-20">
        <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8">
          <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
            Spunkmeyers Pub &amp; Grill
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-[#777] text-sm mt-4">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16">
        <div className="legal-prose max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8">
          {intro && <p className="text-[#bbb] text-lg leading-relaxed mb-8">{intro}</p>}
          {children}
        </div>
      </section>
    </div>
  );
}
