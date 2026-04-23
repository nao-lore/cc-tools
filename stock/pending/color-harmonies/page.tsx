import ColorHarmonies from "./components/ColorHarmonies";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Color Harmonies Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pick a base color and instantly generate complementary, analogous,
            triadic, split-complementary, and tetradic color schemes. Export as
            CSS custom properties or JSON — all in your browser.
          </p>
        </div>

        {/* Tool */}
        <ColorHarmonies />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are Color Harmonies?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Color harmonies are combinations of colors that are pleasing to the
            eye based on their positions on the color wheel. Each harmony type
            uses a different geometric relationship between hues to create a
            distinct visual mood — from the bold contrast of complementary
            colors to the gentle flow of analogous palettes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Harmony Types Explained
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Complementary</strong> — Two colors directly opposite each
              other on the wheel (180°). High contrast, vibrant.
            </li>
            <li>
              <strong>Analogous</strong> — Three colors adjacent on the wheel
              (±30°). Harmonious and natural-looking.
            </li>
            <li>
              <strong>Triadic</strong> — Three colors evenly spaced (120° apart).
              Balanced yet colorful.
            </li>
            <li>
              <strong>Split-Complementary</strong> — Base color plus the two
              colors adjacent to its complement. Less tension than complementary.
            </li>
            <li>
              <strong>Tetradic</strong> — Four colors forming a rectangle on the
              wheel (90° intervals). Rich, complex palettes.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Use the color picker or type a hex code to set your base color. All
            five harmony types update instantly. Click any color swatch to copy
            its hex value to your clipboard. Use the Export buttons to download
            a ready-to-use CSS file with custom properties or a JSON array for
            design tokens.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All color calculations happen in your browser. No data is sent to
            any server.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Color Harmonies Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://css-filter-preview.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSS Filter Preview
              </a>
              <a
                href="https://svg-optimizer-tau.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                SVG Optimizer
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

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
