import Link from "next/link";
import { tools } from "@/lib/tools-config";
import TimezoneConverter from "./components/TimezoneConverter";

const faq = [
  {
    q: "How does the converter handle daylight saving time?",
    a: "It uses browser time zone data, so offsets reflect daylight saving changes for the selected date when the runtime supports that zone.",
  },
  {
    q: "Can I compare several cities?",
    a: "Yes. Add target zones to compare meeting times across cities and regions in one view.",
  },
  {
    q: "Is the time data sent outside the browser?",
    a: "No. Date selection, conversion, copy-oriented review, and validation are handled locally in your browser.",
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
              <p className="text-sm font-semibold text-sky-700">Time & date utility</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Time Zone Converter</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Convert a selected date and time across major time zones, validate offsets, compare cities, and copy results into scheduling notes.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 shadow-sm">
              <div className="font-semibold text-sky-950">Local scheduling check</div>
              <p className="mt-2">Conversion runs in the browser. Use examples, reset the date, and check DST-sensitive offsets before sending invites.</p>
            </div>
          </div>
        </header>

        <TimezoneConverter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Meeting planning" body="Compare Tokyo, UTC, New York, London, and other regions for calls." />
          <InfoCard title="DST validation" body="Use the selected date to verify the current offset during daylight saving periods." />
          <InfoCard title="Copy notes" body="Copy converted times into calendar descriptions, docs, or chat messages after review." />
        </section>

        <InfoSection title="Time Zone Tips" items={[
          ["Use exact dates", "Offsets can change with daylight saving time, so validate the actual meeting date rather than using a rough hour difference."],
          ["Prefer city zones", "City-based IANA zones are more reliable than fixed UTC offsets when DST can apply."],
        ]} />

        <Faq items={faq} />

        <RelatedSection links={[
          ["/epoch-converter", "Epoch Converter", "Convert Unix timestamps"],
          ["/cron-generator", "Cron Generator", "Build cron schedules"],
          ["/eigyoubi", "Business Days", "Count workdays"],
          ["/wareki-converter", "Wareki Converter", "Convert Japanese eras"],
        ]} />

        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>

      <JsonLd faq={faq} name="Time Zone Converter" description="Convert selected times across time zones locally in the browser." url="https://tools.loresync.dev/timezone-converter" />
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
