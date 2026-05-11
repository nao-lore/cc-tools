import Link from "next/link";
import { tools } from "@/lib/tools-config";
import WordCounter from "./components/WordCounter";

const faq = [
  {
    q: "What does the word counter measure?",
    a: "It measures words, characters, characters without spaces, sentences, paragraphs, lines, reading time, speaking time, and keyword density.",
  },
  {
    q: "Is my text uploaded?",
    a: "No. Counting runs locally in your browser, so draft text stays on your device.",
  },
  {
    q: "Can I use it for social posts?",
    a: "Yes. The limit meters help check post length before copying text to X, Instagram, LinkedIn, or other editors.",
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
              <p className="text-sm font-semibold text-indigo-700">Writing utility</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Word Counter
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Count words, characters, sentences, paragraphs, reading time, social limits, and keyword density while you type.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-indigo-900 shadow-sm">
              <div className="font-semibold text-indigo-950">Private drafting</div>
              <p className="mt-2">The text analyzer runs in the browser with copy, clear, sample text, and validation feedback.</p>
            </div>
          </div>
        </header>

        <WordCounter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Validate length" body="Check length, reading time, speaking time, and paragraph structure instantly." />
          <InfoCard title="Post limits" body="Track social platform character limits before moving copy into a publisher." />
          <InfoCard title="Keyword density" body="Review repeated terms without exporting text to another writing tool." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Writing Checks</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Draft fit</h3>
              <p className="mt-1">Use counts to fit essays, captions, product copy, talks, and short-form posts to their target length.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Copy workflow</h3>
              <p className="mt-1">Paste text, inspect the metrics, copy the edited text, or clear the workspace for the next draft.</p>
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
            <Related href="/text-diff" title="Text Diff" body="Compare text versions" />
            <Related href="/markdown-preview" title="Markdown Preview" body="Preview Markdown drafts" />
            <Related href="/dummy-text" title="Dummy Text" body="Generate placeholder copy" />
            <Related href="/mdtable" title="Markdown Table" body="Build tables for docs" />
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
            name: "Word Counter",
            description: "Count words, characters, reading time, post limits, and keyword density locally in the browser.",
            url: "https://tools.loresync.dev/word-counter",
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
