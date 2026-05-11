import Link from "next/link";
import { tools } from "@/lib/tools-config";
import DummyTextGenerator from "./components/DummyTextGenerator";

const faq = [
  {
    q: "What is placeholder text for?",
    a: "Placeholder text fills layouts, prototypes, components, test records, and templates before final copy is ready.",
  },
  {
    q: "Can I output HTML paragraphs?",
    a: "Yes. Enable paragraph tags to export copy wrapped in p elements for quick HTML mockups.",
  },
  {
    q: "Does generated text leave the browser?",
    a: "No. Generation, copy, and clear actions run locally in your browser.",
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
              <p className="text-sm font-semibold text-amber-700">Content utility</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Placeholder Text Generator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Generate dummy copy for designs, prototypes, test data, and documentation with adjustable style, format, and length.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 shadow-sm">
              <div className="font-semibold text-amber-950">Copy-ready output</div>
              <p className="mt-2">Use examples, validation limits, HTML export, copy, and reset-style controls directly in the browser.</p>
            </div>
          </div>
        </header>

        <DummyTextGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Multiple tones" body="Switch between standard filler, technical language, and business-style copy." />
          <InfoCard title="Flexible length" body="Tune paragraph count, sentence count, and words per sentence for the target layout." />
          <InfoCard title="HTML option" body="Export paragraphs with tags when building static mockups or seed content." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">When To Use It</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Design review</h3>
              <p className="mt-1">Fill cards, tables, sidebars, forms, and landing sections with realistic text length during review.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Development testing</h3>
              <p className="mt-1">Generate copy for component states, database seed records, email previews, and screenshot checks.</p>
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
            <Related href="/word-counter" title="Word Counter" body="Measure generated copy length" />
            <Related href="/markdown-preview" title="Markdown Preview" body="Preview formatted drafts" />
            <Related href="/ascii-art" title="ASCII Art" body="Create text decorations" />
            <Related href="/text-diff" title="Text Diff" body="Compare edited versions" />
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
            name: "Placeholder Text Generator",
            description: "Generate placeholder copy, technical filler, business filler, and HTML paragraph output locally in the browser.",
            url: "https://tools.loresync.dev/dummy-text",
            applicationCategory: "UtilityApplication",
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
