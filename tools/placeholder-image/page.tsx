import Link from "next/link";
import { tools } from "@/lib/tools-config";
import PlaceholderImage from "./components/PlaceholderImage";

const faq = [
  {
    q: "What is a placeholder image?",
    a: "A placeholder image is a temporary graphic used while designing layouts, prototypes, and content slots before the final image is ready.",
  },
  {
    q: "Does this upload my image settings anywhere?",
    a: "No. The image is rendered locally in your browser with the Canvas API. The generated image, colors, and text are not uploaded.",
  },
  {
    q: "Which format should I use?",
    a: "Use PNG for crisp UI placeholders, JPEG for simple photographic mocks, and WebP when you want a modern compressed asset for browser testing.",
  },
  {
    q: "Can I use the data URI in HTML or CSS?",
    a: "Yes. You can copy the generated data URI or an img tag and paste it into prototypes, docs, fixtures, or visual regression tests.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← Free online tools
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-sky-700">Image and design tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Placeholder Image Generator
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Create custom placeholder images for mockups, Open Graph previews, thumbnails, cards, and design fixtures.
                Set dimensions, colors, text, format, then download or copy the result.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 shadow-sm">
              <div className="font-semibold text-sky-950">Local Canvas rendering</div>
              <p className="mt-2">
                Images are generated in your browser. No uploads, no account, and no remote image service dependency.
              </p>
            </div>
          </div>
        </header>

        <PlaceholderImage />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Fast layout fixtures" body="Generate exact-size assets for cards, banners, avatar slots, and hero sections." />
          <InfoCard title="Copy-ready output" body="Download PNG, JPEG, or WebP, or copy a data URI / img tag for prototypes." />
          <InfoCard title="Private by default" body="The tool uses Canvas locally, so placeholder text and settings stay on your device." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">How to use placeholder images well</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Match the final aspect ratio</h3>
              <p className="mt-1">
                Use the final slot dimensions whenever possible. This prevents layout shifts when real images replace placeholders.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Use meaningful labels</h3>
              <p className="mt-1">
                Labels such as “Hero image” or “Product card” make prototypes easier to review than generic gray boxes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Choose format intentionally</h3>
              <p className="mt-1">
                PNG keeps text sharp, JPEG is useful for photo-like placeholders, and WebP is good for browser performance testing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Avoid huge inline data URIs</h3>
              <p className="mt-1">
                Data URIs are convenient for small prototypes, but large images should usually be downloaded and served as files.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Common placeholder sizes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SizeCard title="Open Graph" size="1200 x 630" body="Social previews and link cards" />
            <SizeCard title="Hero" size="1920 x 1080" body="Full-width desktop hero areas" />
            <SizeCard title="Card image" size="800 x 450" body="16:9 content and article cards" />
            <SizeCard title="Avatar" size="512 x 512" body="Profile and account image slots" />
            <SizeCard title="Banner" size="728 x 90" body="Narrow horizontal placements" />
            <SizeCard title="Thumbnail" size="300 x 200" body="Lists, galleries, and previews" />
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
          <h2 className="text-xl font-bold text-slate-950">Related tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Related href="/image-compressor" title="Image Compressor" body="Compress image files before publishing" />
            <Related href="/svg-to-png" title="SVG to PNG" body="Convert SVG artwork into raster assets" />
            <Related href="/og-image-preview" title="OG Image Preview" body="Check social card metadata" />
            <Related href="/aspect-ratio" title="Aspect Ratio" body="Calculate image and video ratios" />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools publishes {toolCount}+ free browser-based tools.
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
            name: "Placeholder Image Generator",
            description: "Create custom placeholder images locally with dimensions, colors, text, and export formats.",
            url: "https://tools.loresync.dev/placeholder-image",
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

function SizeCard({ title, size, body }: { title: string; size: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 font-mono text-lg font-bold text-slate-900">{size}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
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
