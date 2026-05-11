import Link from "next/link";
import { tools } from "@/lib/tools-config";
import GradientGenerator from "./components/GradientGenerator";

const faq = [
  {
    q: "Which gradient types are supported?",
    a: "You can create linear and radial gradients, adjust angles or center position, and control multiple color stops.",
  },
  {
    q: "Can I copy Tailwind classes?",
    a: "Yes. For compatible linear gradients, the tool produces Tailwind utility classes. Custom angles and radial gradients use CSS output.",
  },
  {
    q: "Are gradients generated locally?",
    a: "Yes. Preview, random generation, copy actions, and export output run locally in your browser.",
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
              <p className="text-sm font-semibold text-fuchsia-700">CSS design tools</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                CSS Gradient Generator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Create linear and radial gradients with live preview, editable color stops, CSS output, and Tailwind class export.
              </p>
            </div>
            <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4 text-sm leading-6 text-fuchsia-900 shadow-sm">
              <div className="font-semibold text-fuchsia-950">Visual CSS output</div>
              <p className="mt-2">Use presets, random examples, validation limits, copy buttons, and reset by applying a preset.</p>
            </div>
          </div>
        </header>

        <GradientGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Validate stops" body="Add, remove, and position color stops to shape the transition." />
          <InfoCard title="CSS export" body="Copy the background declaration for use in stylesheets or inline previews." />
          <InfoCard title="Tailwind help" body="Get utility classes for common linear gradient directions and colors." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Gradient Tips</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Legibility first</h3>
              <p className="mt-1">When placing text over gradients, test contrast and keep busy transitions away from small labels.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Design systems</h3>
              <p className="mt-1">Store chosen gradients as tokens or utility classes so repeated use stays consistent.</p>
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
            <Related href="/color-palette" title="Color Palette" body="Build color systems" />
            <Related href="/color-converter" title="Color Converter" body="Convert HEX, RGB, HSL" />
            <Related href="/css-box-shadow" title="Box Shadow" body="Tune shadow effects" />
            <Related href="/border-radius" title="Border Radius" body="Preview corner shapes" />
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
            name: "CSS Gradient Generator",
            description: "Create CSS gradients with live preview, copy-ready CSS, and Tailwind class export.",
            url: "https://tools.loresync.dev/css-gradient",
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
