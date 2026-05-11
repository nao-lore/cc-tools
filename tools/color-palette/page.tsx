import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ColorPalette from "./components/ColorPalette";

const faq = [
  {
    q: "How do I choose a color harmony mode?",
    a: "Use complementary for contrast, analogous for calm UI themes, triadic for balanced variety, and monochromatic for single-brand systems.",
  },
  {
    q: "Can I export the palette?",
    a: "Yes. Copy CSS variables, a HEX array, Tailwind config, or JSON from the export panel.",
  },
  {
    q: "Does this tool send my colors to a server?",
    a: "No. Generation, editing, contrast checks that validate color pairs, and copy actions run locally in your browser.",
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
              <p className="text-sm font-semibold text-sky-700">Design tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Color Palette Generator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Generate accessible color palettes, lock favorite swatches, tune HSL values, check WCAG contrast, and copy design tokens for CSS, Tailwind, or JSON.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">Local workflow</div>
              <p className="mt-2">All palette generation and contrast checks validate colors in your browser. Colors are not uploaded.</p>
            </div>
          </div>
        </header>

        <ColorPalette />

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard title="Examples" body="Try brand palettes, dashboard accent sets, or theme tokens for a design system." />
          <InfoCard title="Contrast validation" body="Adjacent swatches show AA/AAA contrast checks so text colors are easier to review." />
          <InfoCard title="Copy-ready exports" body="Use CSS variables, HEX arrays, Tailwind config, or JSON without manual formatting." />
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
            <Related href="/color-converter" title="Color Converter" body="Convert HEX, RGB, HSL, and CSS colors." />
            <Related href="/css-gradient" title="CSS Gradient" body="Build linear and radial gradients." />
            <Related href="/css-box-shadow" title="Box Shadow" body="Create layered shadow tokens." />
            <Related href="/border-radius" title="Border Radius" body="Tune rounded shapes visually." />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Color Palette Generator",
            description: "Generate accessible color palettes and export CSS, Tailwind, HEX, or JSON tokens.",
            url: "https://tools.loresync.dev/color-palette",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
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
