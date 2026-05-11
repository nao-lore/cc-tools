import Link from "next/link";
import { tools } from "@/lib/tools-config";
import FlexboxGenerator from "./components/FlexboxGenerator";

const faq = [
  {
    q: "What is this Flexbox generator for?",
    a: "It helps you test container and child flex properties visually, then copy the generated CSS.",
  },
  {
    q: "Can I reset the layout?",
    a: "Yes. Use the reset control in the editor to return to the default row layout with three children.",
  },
  {
    q: "Is the generated CSS validated?",
    a: "The tool constrains numeric controls and shows the final CSS immediately. Review custom flex-basis values before production use.",
  },
  {
    q: "Is my layout data uploaded?",
    a: "No. Preview, validation, and copy actions run locally in your browser.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← Free online tools
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-indigo-700">CSS layout tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                CSS Flexbox Generator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Build flex layouts visually. Adjust direction, alignment, wrapping, gap, and child properties, then copy clean CSS for your stylesheet.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">Private by default</div>
              <p className="mt-2">The editor runs in your browser and does not send layout settings to a server.</p>
            </div>
          </div>
        </header>

        <FlexboxGenerator />

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard title="Examples" body="Create nav bars, centered panels, wrapping chips, equal columns, and sticky footer patterns." />
          <InfoCard title="Child controls" body="Tune grow, shrink, basis, order, and align-self per item from the live preview." />
          <InfoCard title="Copy output" body="The CSS panel updates as you edit so the final declaration is ready to paste." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">よくある質問</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {faq.map((item) => (
              <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-slate-950">{item.q}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Related Tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Related href="/css-grid" title="CSS Grid" body="Build two-dimensional grid layouts." />
            <Related href="/css-box-shadow" title="Box Shadow" body="Create layered elevation styles." />
            <Related href="/border-radius" title="Border Radius" body="Tune rounded corners visually." />
            <Related href="/tailwindconvert" title="Tailwind Convert" body="Convert CSS snippets to Tailwind classes." />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools publishes {toolCount} free online tools.
        </footer>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function Related({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
    </Link>
  );
}
