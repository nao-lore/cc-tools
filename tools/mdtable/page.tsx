import Link from "next/link";
import { tools } from "@/lib/tools-config";
import TableEditor from "./components/TableEditor";

const faq = [
  {
    q: "Can I import CSV into a Markdown table?",
    a: "Yes. Paste comma-separated or tab-separated rows into the import dialog, then adjust headers and alignment before copying.",
  },
  {
    q: "Does the tool support column alignment?",
    a: "Yes. Each column can be left, center, or right aligned, and the generated Markdown separator row updates automatically.",
  },
  {
    q: "Is table data uploaded?",
    a: "No. Editing, CSV import, validation, reset, and copy actions run locally in your browser.",
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
              <p className="text-sm font-semibold text-emerald-700">Markdown utilities</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Markdown Table Generator</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Build Markdown tables in a spreadsheet-style editor. Import CSV, edit cells, set alignment, validate output, reset the grid, and copy the final table.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 shadow-sm">
              <div className="font-semibold text-emerald-950">Local table editor</div>
              <p className="mt-2">Rows, columns, alignment, CSV import, clear, and clipboard actions stay in the browser.</p>
            </div>
          </div>
        </header>

        <TableEditor />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Spreadsheet editing" body="Edit headers and cells directly before generating Markdown syntax." />
          <InfoCard title="CSV import" body="Paste CSV or TSV data from spreadsheets, for example Name,Role,Status rows, and convert it into table rows." />
          <InfoCard title="Copy-ready output" body="Generate GitHub-flavored Markdown with correct separator rows and alignment." />
        </section>

        <InfoSection
          title="Markdown Table Notes"
          items={[
            ["Alignment syntax", "Left, center, and right alignment map to :---, :---:, and ---: in the separator row."],
            ["Readable tables", "Keep cells short when the raw Markdown will be reviewed in pull requests or README files."],
          ]}
        />

        <Faq items={faq} />

        <RelatedSection
          links={[
            ["/markdown-preview", "Markdown Preview", "Preview rendered Markdown"],
            ["/text-diff", "Text Diff", "Compare text changes"],
            ["/json-to-csv", "JSON to CSV", "Convert structured data"],
            ["/word-counter", "Word Counter", "Check document length"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>

      <JsonLd faq={faq} name="Markdown Table Generator" description="Create Markdown tables locally with CSV import, alignment controls, reset, validation, and copy-ready output." url="https://tools.loresync.dev/mdtable" />
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
