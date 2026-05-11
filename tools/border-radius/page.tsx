import Link from "next/link";
import { tools } from "@/lib/tools-config";
import BorderRadiusGenerator from "./components/BorderRadiusGenerator";

const faq = [
  {
    q: "What does border-radius control?",
    a: "It controls corner curvature. You can set one value for all corners or separate values for top-left, top-right, bottom-right, and bottom-left.",
  },
  {
    q: "What is elliptical radius?",
    a: "Elliptical syntax uses horizontal and vertical radii separated by a slash, such as 40px 20px / 20px 40px.",
  },
  {
    q: "Can I reset or use examples?",
    a: "Use the presets for rounded cards, pills, circles, blobs, leaves, drops, and ticket-like shapes.",
  },
  {
    q: "Are preview settings uploaded?",
    a: "No. Preview, controls that validate ranges, and copy actions run locally in your browser.",
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
              <p className="text-sm font-semibold text-blue-700">CSS design tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                CSS Border Radius Generator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Design rounded corners visually. Adjust linked corners, independent values, elliptical radii, units, preview styling, and copy the final CSS.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">Browser-only editor</div>
              <p className="mt-2">All settings, range checks that validate controls, and copy actions stay in your browser.</p>
            </div>
          </div>
        </header>

        <BorderRadiusGenerator />

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard title="Examples" body="Start from pill, circle, blob, leaf, drop, ticket, and rounded-card presets." />
          <InfoCard title="Elliptical mode" body="Control horizontal and vertical corner radii separately for organic shapes." />
          <InfoCard title="Copy output" body="The generated border-radius declaration is ready to paste into CSS." />
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
            <Related href="/css-box-shadow" title="Box Shadow" body="Create layered shadows." />
            <Related href="/css-gradient" title="CSS Gradient" body="Build CSS backgrounds." />
            <Related href="/css-flexbox" title="CSS Flexbox" body="Preview flex layouts." />
            <Related href="/color-palette" title="Color Palette" body="Generate accessible colors." />
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
