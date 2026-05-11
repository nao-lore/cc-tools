import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AnimationGenerator from "./components/AnimationGenerator";

const faq = [
  {
    q: "Which CSS properties animate best?",
    a: "Transform and opacity usually perform best because browsers can animate them without expensive layout recalculation.",
  },
  {
    q: "Can I copy the generated keyframes?",
    a: "Yes. Use Copy CSS to export the keyframes and animation declaration.",
  },
  {
    q: "How should I validate accessibility?",
    a: "Keep motion purposeful and test reduced-motion alternatives for users who prefer less animation.",
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
              <p className="text-sm font-semibold text-violet-700">CSS motion tools</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">CSS Animation Generator</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Build keyframe animations visually, test presets, validate timing, reset states, and copy production-ready CSS.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-900 shadow-sm">
              <div className="font-semibold text-violet-950">Preview before copy</div>
              <p className="mt-2">Experiment locally with presets, timing, easing, transforms, and clear motion settings in the browser.</p>
            </div>
          </div>
        </header>

        <AnimationGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Keyframe editor" body="Edit percent stops, transforms, opacity, color, and timing from one panel." />
          <InfoCard title="Motion presets" body="Start with examples like fade, slide, bounce, rotate, and scale." />
          <InfoCard title="Copy CSS" body="Export complete @keyframes and animation declarations for your stylesheet." />
        </section>

        <InfoSection title="Animation Notes" items={[
          ["Performance", "Prefer transform and opacity for smooth animations, especially on mobile devices."],
          ["Reduced motion", "Pair decorative motion with a prefers-reduced-motion fallback when shipping to production."],
        ]} />

        <Faq items={faq} />

        <RelatedSection links={[
          ["/css-flexbox", "CSS Flexbox", "Build alignment layouts"],
          ["/css-grid", "CSS Grid", "Build grid layouts"],
          ["/css-gradient", "CSS Gradient", "Create backgrounds"],
          ["/css-box-shadow", "Box Shadow", "Tune shadow depth"],
        ]} />

        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>

      <JsonLd faq={faq} name="CSS Animation Generator" description="Create CSS keyframe animations with local preview and copy-ready output." url="https://tools.loresync.dev/css-animation" />
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
