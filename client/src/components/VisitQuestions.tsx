import { Link } from "wouter";
import { visitQuestions } from "@/data/visit-questions";

export default function VisitQuestions() {
  return (
    <section
      className="bg-[#111111] py-14 sm:py-20 border-t border-white/10"
      aria-labelledby="visit-questions-heading"
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="visit-questions-heading"
          className="text-3xl sm:text-5xl font-heading text-[#F5F0EB] mb-8"
        >
          Planning a Visit?
        </h2>
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {visitQuestions.map(({ question, answer }) => (
            <div key={question}>
              <h3 className="font-heading text-xl text-[#F5F0EB] mb-2">
                {question}
              </h3>
              <p className="text-[#bbb] leading-relaxed">{answer}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-10">
          <Link href="/menu" className="btn-premium">
            Browse the Menu
          </Link>
          <Link href="/events" className="btn-ghost">
            Events &amp; Party Requests
          </Link>
        </div>
      </div>
    </section>
  );
}
