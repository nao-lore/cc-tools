import Link from "next/link";
import { tools } from "@/lib/tools-config";
import JsMinifier from "./components/JsMinifier";

const faq = [
  {
    q: "What does JavaScript minification do?",
    a: "It removes comments and unnecessary whitespace while preserving string literals, template literals, and regex literals.",
  },
  {
    q: "Can I beautify compressed JavaScript?",
    a: "Yes. Use Beautify to reset dense code into a readable multiline shape for inspection.",
  },
  {
    q: "Is pasted JavaScript uploaded?",
    a: "No. Minify, beautify, validation, copy, and clear actions run locally in your browser.",
  },
];

type FaqItem = (typeof faq)[number];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" aria-label="Back to free online tools" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← Free online tools
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-orange-700">Minifier tools</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">JavaScript Minifier</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Minify or beautify JavaScript snippets, validate output size, clear the editor, and copy optimized code.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-900 shadow-sm">
              <div className="font-semibold text-orange-950">Browser-only transform</div>
              <p className="mt-2">Use examples, compression stats, copy, export-style review, and reset controls without sending code out.</p>
            </div>
          </div>
        </header>

        <JsMinifier />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Preserve literals" body="The parser keeps strings, templates, and regex literals intact while removing noise." />
          <InfoCard title="Beautify reset" body="Reformat compressed snippets for easier inspection and debugging." />
          <InfoCard title="Copy output" body="Copy minified or beautified code after checking size changes." />
        </section>

        <InfoSection title="JavaScript Optimization Notes" items={[
          ["Quick snippets", "This tool is useful for small scripts and code review, while full apps should use a bundler or Terser."],
          ["Validate behavior", "Run tests or browser checks after minifying complex generated scripts or syntax edge cases."],
        ]} />

        <Faq items={faq} />

        <RelatedSection links={[
          ["/minify-css", "CSS Minifier", "Compress CSS"],
          ["/json-formatter", "JSON Formatter", "Format JSON"],
          ["/regex-tester", "Regex Tester", "Test patterns"],
          ["/html-entity", "HTML Entity", "Encode text"],
        ]} />

        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>

      <JsonLd faq={faq} name="JavaScript Minifier" description="Minify and beautify JavaScript locally in the browser with copy-ready output." url="https://tools.loresync.dev/minify-js" />
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div>;
}

function InfoSection({ title, items }: { title: string; items: [string, string][] }) {
  return <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold text-slate-950">{title}</h2><div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">{items.map(([heading, body]) => <div key={heading}><h3 className="font-semibold text-slate-900">{heading}</h3><p className="mt-1">{body}</p></div>)}</div></section>;
}

function Faq({ items }: { items: FaqItem[] }) {
  return <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold text-slate-950">FAQ</h2><div className="mt-4 divide-y divide-slate-200">{items.map((item) => <div key={item.q} className="py-4 first:pt-0 last:pb-0"><h3 className="font-semibold text-slate-950">{item.q}</h3><p className="mt-1 text-sm leading-7 text-slate-600">{item.a}</p></div>)}</div></section>;
}

function RelatedSection({ links }: { links: [string, string, string][] }) {
  return <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold text-slate-950">Related Tools</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{links.map(([href, title, body]) => <Link key={href} href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50"><div className="text-sm font-semibold text-slate-950">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{body}</div></Link>)}</div></section>;
}

function JsonLd({ faq, name, description, url }: { faq: FaqItem[]; name: string; description: string; url: string }) {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name, description, url, applicationCategory: "DeveloperApplication", operatingSystem: "All", offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" } }) }} /></>;
}
