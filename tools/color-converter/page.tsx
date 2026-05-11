import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ColorConverter from "./components/ColorConverter";

const faq = [
  {
    q: "Which color formats can I convert?",
    a: "The converter keeps HEX, RGB, HSL, and CMYK values in sync and shows a closest CSS color name.",
  },
  {
    q: "Can I check contrast?",
    a: "Yes. Use the background color field to validate WCAG AA and AAA contrast status for sample text.",
  },
  {
    q: "Does the selected color get uploaded?",
    a: "No. Conversion, history, validation, and copy actions run locally in your browser.",
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
              <p className="text-sm font-semibold text-teal-700">Color tools</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Color Converter
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Convert colors between HEX, RGB, HSL, and CMYK, pick colors visually, copy values, and check WCAG contrast.
              </p>
            </div>
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900 shadow-sm">
              <div className="font-semibold text-teal-950">Accessible color checks</div>
              <p className="mt-2">Use examples, recent colors, validation badges, copy actions, and reset by choosing a history swatch.</p>
            </div>
          </div>
        </header>

        <ColorConverter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Format sync" body="Edit HEX, RGB, or HSL and the other formats update immediately." />
          <InfoCard title="Contrast badges" body="Check AA and AAA status against a chosen background color." />
          <InfoCard title="Copy values" body="Copy CSS-friendly HEX, RGB, HSL, and CMYK strings from the result cards." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Format Notes</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">HEX and RGB</h3>
              <p className="mt-1">Use HEX or RGB for CSS, design tokens, browser previews, and screen-focused assets.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">HSL and CMYK</h3>
              <p className="mt-1">Use HSL for easier shade adjustments and CMYK as an approximate print reference.</p>
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
            <Related href="/color-palette" title="Color Palette" body="Generate palettes" />
            <Related href="/css-gradient" title="CSS Gradient" body="Build gradient backgrounds" />
            <Related href="/tailwindconvert" title="Tailwind Convert" body="Translate CSS utilities" />
            <Related href="/px-to-rem" title="PX to REM" body="Convert CSS units" />
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
            name: "Color Converter",
            description: "Convert HEX, RGB, HSL, and CMYK colors with WCAG contrast checks locally in the browser.",
            url: "https://tools.loresync.dev/color-converter",
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
