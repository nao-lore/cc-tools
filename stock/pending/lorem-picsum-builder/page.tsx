import PlaceholderUrlBuilder from "./components/PlaceholderUrlBuilder";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Placeholder Image URL Builder
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Generate placeholder image URLs from picsum.photos, placehold.co, and
          via.placeholder.com. Configure size, colors, and text — then copy the
          URL or HTML tag instantly.
        </p>
      </div>

      {/* Tool */}
      <div className="px-4 pb-8">
        <PlaceholderUrlBuilder />
      </div>

      {/* AdSense placeholder */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div
          className="rounded-lg border border-dashed p-8 text-center text-sm opacity-30"
          style={{ borderColor: "var(--border)" }}
        >
          Ad space
        </div>
      </div>

      {/* SEO content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <article
          className="rounded-xl p-6 sm:p-8 border space-y-6 text-sm leading-relaxed opacity-80"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <section>
            <h2 className="text-lg font-bold mb-2">
              What is a placeholder image?
            </h2>
            <p>
              Placeholder images are temporary stand-ins used during design and
              development when real assets are not yet available. Services like
              picsum.photos serve random photographs, placehold.co generates
              solid-color tiles with custom text, and via.placeholder.com
              produces simple labeled rectangles. All three are free and require
              no API key.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">How to use this tool</h2>
            <p>
              Select a service, configure the dimensions and any service-specific
              options, then copy the generated URL or the ready-to-paste HTML{" "}
              <code className="font-mono text-xs bg-black/5 px-1 rounded">
                &lt;img&gt;
              </code>{" "}
              tag. Use the <strong>Multiple URLs</strong> list to collect several
              different configurations in one place before copying them all at
              once.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">
              Choosing the right service
            </h2>
            <p>
              Use <strong>picsum.photos</strong> when you need realistic photo
              content — great for article cards and hero sections. Use{" "}
              <strong>placehold.co</strong> when you need a specific color
              palette or custom label text for wireframes. Use{" "}
              <strong>via.placeholder.com</strong> for a classic grey box with
              dimensions printed inside, the most neutral option for layout
              prototyping.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Tips</h2>
            <p>
              All three services support HTTPS and work cross-origin without
              CORS issues. picsum.photos URLs can be locked to a specific image
              by setting a seed, which is useful when you need consistent
              screenshots. For responsive designs, consider using the URL in a{" "}
              <code className="font-mono text-xs bg-black/5 px-1 rounded">
                srcset
              </code>{" "}
              attribute or a CSS{" "}
              <code className="font-mono text-xs bg-black/5 px-1 rounded">
                background-image
              </code>{" "}
              property instead of an{" "}
              <code className="font-mono text-xs bg-black/5 px-1 rounded">
                &lt;img&gt;
              </code>{" "}
              tag.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Placeholder Image URL Builder — Free online tool. No signup
            required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://image-color-picker.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Image Color Picker
              </a>
              <a
                href="https://svg-optimizer-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                SVG Optimizer
              </a>
              <a
                href="https://color-contrast-checker-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Color Contrast Checker
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
