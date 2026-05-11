import Link from "next/link";
import { tools } from "@/lib/tools-config";
import RegexTester from "./components/RegexTester";

const faq = [
  {
    q: "Which regex engine does this use?",
    a: "It uses JavaScript RegExp in the browser, so behavior matches modern JavaScript regular expressions.",
  },
  {
    q: "Can I test replacements?",
    a: "Yes. Enter a replacement string and use JavaScript replacement tokens such as $1 and $2 for capture groups.",
  },
  {
    q: "Can I copy the output?",
    a: "Yes. The tester includes copy actions for the current pattern and match summary.",
  },
  {
    q: "Is my text uploaded?",
    a: "No. Pattern validation, matching, replacement, and copy actions run locally in your browser.",
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
              <p className="text-sm font-semibold text-emerald-700">Developer tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Regex Tester
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Test JavaScript regular expressions with live highlights, capture groups, replacement preview, quick examples, validation errors, and copy-ready output.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">Runs locally</div>
              <p className="mt-2">Your pattern and sample text stay in the browser. Nothing is uploaded for matching.</p>
            </div>
          </div>
        </header>

        <RegexTester />

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard title="Examples" body="Start from email, URL, phone, IPv4, or ISO date presets." />
          <InfoCard title="Capture groups" body="Inspect group values and match indexes for each result." />
          <InfoCard title="Replace preview" body="Test substitutions before using a pattern in production code." />
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
            <Related href="/text-diff" title="Text Diff" body="Compare two text snippets." />
            <Related href="/word-counter" title="Word Counter" body="Count words, chars, and lines." />
            <Related href="/json-formatter" title="JSON Formatter" body="Format and validate JSON." />
            <Related href="/sql-formatter" title="SQL Formatter" body="Format SQL queries." />
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
