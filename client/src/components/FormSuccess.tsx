interface FormSuccessProps {
  heading: string;
  lines: string[];
  className?: string;
}

/**
 * Shared animated success state for forms: check draws in, message lines
 * rise in a stagger. Motion-safe via the .success-* CSS rules.
 */
export default function FormSuccess({ heading, lines, className = "" }: FormSuccessProps) {
  return (
    <div className={`bg-[#222] border border-[#E8601C]/20 p-8 text-center ${className}`}>
      <div className="success-icon w-16 h-16 mx-auto mb-5 rounded-full bg-[#E8601C]/10 border border-[#E8601C]/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-[#E8601C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="success-line font-heading text-2xl text-[#E8601C] mb-3" style={{ animationDelay: "0.35s" }}>
        {heading}
      </h3>
      {lines.map((line, i) => (
        <p
          key={i}
          className="success-line text-[#999] leading-relaxed"
          style={{ animationDelay: `${0.5 + i * 0.15}s` }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
