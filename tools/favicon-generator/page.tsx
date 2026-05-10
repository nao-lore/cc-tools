import Link from "next/link";
import { tools } from "@/lib/tools-config";
import FaviconGenerator from "./components/FaviconGenerator";

const faq = [
  {
    q: "Does this favicon generator upload my image?",
    a: "No. Text, emoji, uploaded images, previews, ICO files, and PNG downloads are generated locally in your browser.",
  },
  {
    q: "Which favicon sizes does this tool generate?",
    a: "It generates 16x16, 32x32, 48x48, 180x180, 192x192, and 512x512 PNG files, plus a favicon.ico containing 16, 32, and 48 pixel images.",
  },
  {
    q: "Should I use text, emoji, or an uploaded image?",
    a: "Use text for simple initials, emoji for quick prototypes, and an uploaded image for a real brand mark. Always check the 16x16 preview before shipping.",
  },
  {
    q: "Where should I place the downloaded files?",
    a: "Put the files in your site's public root or static assets directory, then copy the generated link tags into the document head.",
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
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-indigo-700">Image Tools</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Favicon Generator</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Create ICO and PNG favicons from text, emoji, or a local image. Preview browser-tab sizes, download the common icon set, and copy install tags without uploading files.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">Output set</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-700">
                <span className="rounded-lg bg-slate-100 px-2 py-2">ICO</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2">PNG</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2">HTML</span>
              </div>
              <p className="mt-3">Local privacy: every preview is generated in your browser.</p>
            </div>
          </div>
        </header>

        <FaviconGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Small-size preview" body="Check 16x16 and 32x32 output before you ship a mark that becomes unreadable in browser tabs." />
          <InfoCard title="ICO + PNG outputs" body="Download favicon.ico for broad compatibility and PNG files for Apple touch icons, Android icons, and PWA assets." />
          <InfoCard title="No upload step" body="The image file is decoded by your browser. cc-tools does not receive or store the source image." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Favicon files this tool creates</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Browser and desktop icons</h3>
              <p className="mt-1">
                The generated favicon.ico includes 16x16, 32x32, and 48x48 images. Those sizes cover classic browser tabs, bookmarks, and desktop shortcuts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Mobile and PWA icons</h3>
              <p className="mt-1">
                The 180x180, 192x192, and 512x512 PNG files are useful for Apple touch icons, Android home-screen icons, and progressive web app assets.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Design validation</h3>
              <p className="mt-1">
                A favicon should remain recognizable at 16x16. Use simple shapes, high contrast, and one or two characters at most.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Install tags</h3>
              <p className="mt-1">
                After downloading files, copy the generated HTML link tags into your document head and place files in the public root or matching static path.
              </p>
            </div>
          </div>
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
          <h2 className="text-xl font-bold text-slate-950">Related tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Related href="/svg-to-png" title="SVG to PNG" body="Export vector marks as PNG images" />
            <Related href="/image-compressor" title="Image Compressor" body="Shrink images before publishing" />
            <Related href="/placeholder-image" title="Placeholder Image" body="Generate temporary image assets" />
            <Related href="/qr-generator" title="QR Generator" body="Create QR codes for links and text" />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools publishes {toolCount}+ free online tools.
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
