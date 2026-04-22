import CssUnitConverter from "./components/CssUnitConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              px
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CSS Unit Converter</h1>
              <p className="text-xs text-gray-500">px, rem, em, vw, vh, vmin, vmax, pt, cm, mm, in</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CssUnitConverter />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Online CSS Unit Converter</h2>
            <p>
              Convert between all major CSS units instantly: px (pixels), rem (root em), em, vw (viewport width),
              vh (viewport height), vmin, vmax, pt (points), cm, mm, and inches. Set your own root font size
              and viewport dimensions for accurate em/rem/viewport-relative conversions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Use</h2>
            <p>
              Enter a value in any unit field — all other units update instantly (bidirectional). Adjust the root
              font size (default 16px) and viewport dimensions (default 1920×1080) in the Config panel to match
              your project. Use the copy button next to each result to copy a single value. The reference table
              shows your input converted to all units at a glance.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">px vs rem vs em</h2>
            <p>
              <strong>px</strong> is an absolute pixel unit. <strong>rem</strong> is relative to the root element
              font size (typically 16px by default in browsers). <strong>em</strong> is relative to the current
              element&apos;s font size — it inherits and compounds, making it trickier than rem. For most scalable
              typography, rem is preferred.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Viewport Units (vw, vh, vmin, vmax)</h2>
            <p>
              Viewport units are percentages of the browser window. 1vw = 1% of viewport width, 1vh = 1% of
              viewport height. vmin is the smaller of vw/vh; vmax is the larger. These are useful for fluid
              layouts and responsive typography that scales with the screen size.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">CSS Unit Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://color-contrast-checker-coral.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">Color Contrast Checker</a>
              <a href="https://unit-converter-nu-black.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">Unit Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
