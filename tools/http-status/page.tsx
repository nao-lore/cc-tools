import Link from "next/link";
import { tools } from "@/lib/tools-config";
import HttpStatusCodes from "./components/HttpStatusCodes";

const faq = [
  {
    q: "What is the difference between 401 and 403?",
    a: "401 means authentication is required or missing. 403 means the client is known, but access is not allowed for that resource.",
  },
  {
    q: "Which status codes are most common in APIs?",
    a: "200, 201, 204, 301, 302, 400, 401, 403, 404, 409, 422, 429, 500, 502, and 503 are common during API debugging.",
  },
  {
    q: "Is search data uploaded?",
    a: "No. Search, filtering, validation, expand/collapse, and copy actions run locally in your browser.",
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
              <p className="text-sm font-semibold text-rose-700">Web reference</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">HTTP Status Codes</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Search HTTP response codes by number or keyword, expand practical explanations, validate categories, and copy descriptions for docs or debugging notes.
              </p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900 shadow-sm">
              <div className="font-semibold text-rose-950">Local reference</div>
              <p className="mt-2">Search state, expanded details, and clipboard actions stay in the browser.</p>
            </div>
          </div>
        </header>

        <HttpStatusCodes />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Grouped by class" body="Browse informational, success, redirect, client error, and server error responses." />
          <InfoCard title="Practical examples" body="Each expanded code includes when it appears and a concrete debugging example." />
          <InfoCard title="Copy snippets" body="Copy a concise status description into comments, runbooks, or API documentation." />
        </section>

        <InfoSection
          title="HTTP Debugging Notes"
          items={[
            ["Client vs server", "4xx usually points to request, auth, or permission issues. 5xx usually points to upstream or server-side failure."],
            ["Redirect methods", "Use 307 or 308 when the client must preserve the original HTTP method across a redirect."],
          ]}
        />

        <Faq items={faq} />

        <RelatedSection
          links={[
            ["/url-encoder", "URL Encoder", "Encode request URLs"],
            ["/jwt-decoder", "JWT Decoder", "Inspect auth tokens"],
            ["/json-formatter", "JSON Formatter", "Format API payloads"],
            ["/regex-tester", "Regex Tester", "Test matching logic"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>

      <JsonLd faq={faq} name="HTTP Status Codes" description="Search and copy HTTP response code descriptions locally with practical API debugging examples." url="https://tools.loresync.dev/http-status" />
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
