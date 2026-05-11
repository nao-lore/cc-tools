import Link from "next/link";
import { tools } from "@/lib/tools-config";
import MarkdownPreview from "./components/MarkdownPreview";

const faq = [
  {
    q: "What Markdown syntax is supported?",
    a: "The preview supports headings, emphasis, links, images, code blocks, blockquotes, lists, tables, and horizontal rules.",
  },
  {
    q: "Can I copy the generated HTML?",
    a: "Yes. Use Copy HTML to export rendered markup, or Copy MD to copy the source Markdown.",
  },
  {
    q: "Does the editor send content to a server?",
    a: "No. Markdown parsing and preview rendering run locally in your browser.",
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
              <p className="text-sm font-semibold text-violet-700">Writing & docs</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Markdown Preview
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Write Markdown, preview rendered HTML, switch views, copy source text, and export HTML for docs or CMS workflows.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-900 shadow-sm">
              <div className="font-semibold text-violet-950">Browser preview</div>
              <p className="mt-2">Parsing, preview, copy, sample content, validation, and clear-style editing stay local to the browser.</p>
            </div>
          </div>
        </header>

        <MarkdownPreview />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Split editing" body="Edit Markdown and see the rendered preview next to the source." />
          <InfoCard title="Copy or export" body="Copy Markdown source or HTML output without leaving the page." />
          <InfoCard title="Validate output" body="Start from a syntax-rich example and reset by replacing the editor text." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Markdown Workflow</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Documentation drafts</h3>
              <p className="mt-1">Preview README files, docs pages, release notes, and notes before committing or publishing.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">HTML handoff</h3>
              <p className="mt-1">Use the HTML copy action when a CMS or email editor accepts markup instead of Markdown.</p>
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
            <Related href="/mdtable" title="Markdown Table" body="Generate table syntax" />
            <Related href="/html-to-markdown" title="HTML to Markdown" body="Convert markup back to Markdown" />
            <Related href="/text-diff" title="Text Diff" body="Compare document versions" />
            <Related href="/word-counter" title="Word Counter" body="Measure draft length" />
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
            name: "Markdown Preview",
            description: "Write Markdown, preview rendered HTML, copy source text, and export HTML locally in the browser.",
            url: "https://tools.loresync.dev/markdown-preview",
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
