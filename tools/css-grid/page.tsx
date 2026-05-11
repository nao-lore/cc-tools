import Link from "next/link";
import { tools } from "@/lib/tools-config";
import GridGenerator from "./components/GridGenerator";

const faq = [
  {
    q: "When should I use CSS Grid?",
    a: "Use CSS Grid for two-dimensional layouts where rows and columns both matter, such as dashboards, galleries, and page shells.",
  },
  {
    q: "Can I export the generated CSS?",
    a: "Yes. The generator produces copy-ready CSS for the container and template-area classes.",
  },
  {
    q: "Does this save layouts online?",
    a: "No. The preview and generated CSS are handled locally in your browser.",
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
              <p className="text-sm font-semibold text-blue-700">CSS layout tools</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                CSS Grid Generator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Visually build CSS Grid layouts, edit columns, rows, gaps, template areas, and copy production-ready CSS.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 shadow-sm">
              <div className="font-semibold text-blue-950">Layout presets</div>
              <p className="mt-2">Start from examples, validate track values, reset through presets, and export CSS directly from the browser.</p>
            </div>
          </div>
        </header>

        <GridGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Grid presets" body="Try dashboard, gallery, sidebar, and holy-grail examples before editing." />
          <InfoCard title="Template areas" body="Name areas visually and copy readable grid-template-areas CSS." />
          <InfoCard title="Responsive base" body="Use generated CSS as a starting point for media queries and layout variants." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Grid Design Notes</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Two-dimensional layout</h3>
              <p className="mt-1">Grid is best when the row and column structure both shape the final interface.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Readable areas</h3>
              <p className="mt-1">Named areas make page shells easier to maintain than pure line-number placement.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">FAQ</h2>
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
            <Related href="/css-flexbox" title="CSS Flexbox" body="Build one-axis layouts" />
            <Related href="/css-animation" title="CSS Animation" body="Generate keyframes" />
            <Related href="/border-radius" title="Border Radius" body="Shape corners visually" />
            <Related href="/css-box-shadow" title="Box Shadow" body="Tune shadows with preview" />
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
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSS Grid Generator",
            description: "Visually build CSS Grid layouts and export copy-ready CSS locally in the browser.",
            url: "https://tools.loresync.dev/css-grid",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
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
