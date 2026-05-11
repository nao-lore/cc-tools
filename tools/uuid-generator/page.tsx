import Link from "next/link";
import { tools } from "@/lib/tools-config";
import UuidGenerator from "./components/UuidGenerator";

const faq = [
  {
    q: "What is a UUID v4?",
    a: "A UUID v4 is a 128-bit identifier generated from random bytes and formatted with version and variant bits.",
  },
  {
    q: "Are generated UUIDs uploaded?",
    a: "No. Generation uses browser crypto APIs locally, and generated values stay on your device unless you copy them elsewhere.",
  },
  {
    q: "Which format should I choose?",
    a: "Use the standard dashed lowercase format for most APIs and databases. Use uppercase or no-dash formats only when a system requires them.",
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
              <p className="text-sm font-semibold text-emerald-700">Developer generator</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">UUID Generator</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Generate UUID v4 values in bulk, validate the output format, reset counts, and copy single IDs or full lists.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 shadow-sm">
              <div className="font-semibold text-emerald-950">Browser crypto</div>
              <p className="mt-2">IDs are generated locally with Web Crypto support. Use examples and clear regenerated lists without sending data out.</p>
            </div>
          </div>
        </header>

        <UuidGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Bulk output" body="Generate 1, 5, 10, 50, or 100 identifiers for seed data and tests." />
          <InfoCard title="Format choices" body="Switch dashed, no-dash, lowercase, and uppercase output for integration validation." />
          <InfoCard title="Copy actions" body="Copy one identifier or the entire generated list to the clipboard." />
        </section>

        <InfoSection title="UUID Usage Notes" items={[
          ["Distributed IDs", "UUIDs are useful when several systems need to create identifiers without a shared sequence."],
          ["Storage format", "Keep one canonical format in a project so logs, URLs, and database records remain consistent."],
        ]} />

        <Faq items={faq} />

        <RelatedSection links={[
          ["/password-generator", "Password Generator", "Generate secure secrets"],
          ["/hash-generator", "Hash Generator", "Create hashes"],
          ["/qr-generator", "QR Generator", "Encode IDs as QR"],
          ["/regex-tester", "Regex Tester", "Validate ID patterns"],
        ]} />

        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>

      <JsonLd faq={faq} name="UUID Generator" description="Generate UUID v4 values locally in the browser with copy-ready formats." url="https://tools.loresync.dev/uuid-generator" />
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
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name, description, url, applicationCategory: "UtilityApplication", operatingSystem: "All", offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" } }) }} /></>;
}
