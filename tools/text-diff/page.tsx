import Link from "next/link";
import { tools } from "@/lib/tools-config";
import DiffTool from "./components/DiffTool";

const faq = [
  {
    q: "What does a text diff show?",
    a: "It highlights added lines, removed lines, unchanged lines, and paired inline changes so you can review edits quickly.",
  },
  {
    q: "Is text comparison private?",
    a: "Yes. Diff calculation runs locally in your browser, and compared text is not sent to a server.",
  },
  {
    q: "Can I copy the diff result?",
    a: "Yes. After comparing, use Copy diff to export a plain-text diff summary.",
  },
];

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
              <p className="text-sm font-semibold text-rose-700">Developer text utility</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Text Diff Tool
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Compare two text versions line by line, review inline changes, ignore whitespace or case, and copy a diff summary.
              </p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900 shadow-sm">
              <div className="font-semibold text-rose-950">Browser-only compare</div>
              <p className="mt-2">Use sample text, clear controls, validation-friendly options, and export copy without uploading content.</p>
            </div>
          </div>
        </header>

        <DiffTool />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Validate changes" body="See additions and removals in one unified view with paired character highlights." />
          <InfoCard title="Side-by-side" body="Compare original and modified text in two columns for review workflows." />
          <InfoCard title="Copy diff" body="Export the diff summary to tickets, review notes, or documentation." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Comparison Workflow</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Review edits</h3>
              <p className="mt-1">Paste old and new versions to review copy changes, config edits, snippets, and generated output.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Reduce noise</h3>
              <p className="mt-1">Ignore whitespace or case when formatting changes would otherwise hide the important difference.</p>
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
            <Related href="/word-counter" title="Word Counter" body="Measure text length" />
            <Related href="/json-formatter" title="JSON Formatter" body="Format data before comparing" />
            <Related href="/markdown-preview" title="Markdown Preview" body="Preview document edits" />
            <Related href="/regex-tester" title="Regex Tester" body="Test extraction patterns" />
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
            name: "Text Diff Tool",
            description: "Compare two text versions, highlight changes, and copy a diff summary locally in the browser.",
            url: "https://tools.loresync.dev/text-diff",
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
