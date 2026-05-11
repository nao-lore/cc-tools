import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AsciiArtGenerator from "./components/AsciiArtGenerator";

const faq = [
  {
    q: "Where can ASCII art be used?",
    a: "ASCII art works in terminals, README files, code comments, plain-text emails, chat messages, and documentation where monospaced text is supported.",
  },
  {
    q: "Does this tool upload my text?",
    a: "No. The generator runs locally in your browser, and the input text is not sent to a server.",
  },
  {
    q: "Why does alignment matter?",
    a: "ASCII art relies on equal-width characters. Use a monospaced font when pasting the result into documentation or a terminal.",
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
              <p className="text-sm font-semibold text-cyan-700">Text & terminal tools</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                ASCII Art Generator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Convert text into large ASCII banners, wrap notes in boxes, and copy plain-text decorations for README files, terminals, and comments.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900 shadow-sm">
              <div className="font-semibold text-cyan-950">Local text tool</div>
              <p className="mt-2">Generation, preview, copy, examples, and clear actions run inside the browser for quick plain-text work.</p>
            </div>
          </div>
        </header>

        <AsciiArtGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Banner text" body="Turn short labels into large monospaced headers for docs and terminals." />
          <InfoCard title="Boxed notes" body="Create boxed callouts with selectable border styles and copy-ready output." />
          <InfoCard title="Validate width" body="Short input works best; reset or clear the editor when output gets too wide." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Practical Uses</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">README headers</h3>
              <p className="mt-1">Use ASCII banners to split sections in project notes, release docs, and command-line examples.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Plain-text export</h3>
              <p className="mt-1">The result copies as raw text, so it stays usable in source files, email, tickets, and shell output.</p>
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
            <Related href="/dummy-text" title="Dummy Text" body="Generate filler copy for layouts" />
            <Related href="/markdown-preview" title="Markdown Preview" body="Write and preview Markdown" />
            <Related href="/word-counter" title="Word Counter" body="Count words and characters" />
            <Related href="/text-diff" title="Text Diff" body="Compare two text versions" />
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
            name: "ASCII Art Generator",
            description: "Convert text into ASCII banners, boxed notes, and plain-text decorations in the browser.",
            url: "https://tools.loresync.dev/ascii-art",
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
