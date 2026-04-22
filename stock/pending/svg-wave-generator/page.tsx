import SvgWaveGenerator from "./components/SvgWaveGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            SVG Wave Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate smooth SVG wave dividers for web pages. Configure amplitude, frequency, layers,
            and colors — then copy the inline SVG or download the file.
          </p>
        </div>

        {/* Tool */}
        <SvgWaveGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are SVG Wave Dividers?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            SVG wave dividers are scalable vector graphics shapes used to create visually smooth
            transitions between page sections. Because they are SVGs, they scale perfectly to any
            screen size without pixelation — making them ideal for hero sections, feature blocks,
            and footer transitions on modern websites.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Adjust Amplitude</strong> to control the wave height (10–100 px).
            </li>
            <li>
              <strong>Set Frequency</strong> to control how many wave cycles appear across the width (1–5).
            </li>
            <li>
              <strong>Choose Layers</strong> (1–3) to stack multiple overlapping waves for depth.
            </li>
            <li>
              <strong>Pick a Wave Type</strong>: Gentle Sine for smooth curves, Sharp for triangular peaks, or Layered for complex multi-harmonic waves.
            </li>
            <li>
              <strong>Set Layer Colors</strong> and opacity for each wave layer individually.
            </li>
            <li>
              <strong>Toggle Flip Vertical</strong> to point the wave upward instead of downward.
            </li>
            <li>
              <strong>Copy the SVG</strong> code or <strong>Download</strong> the .svg file, then embed it in your HTML.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Embedding as a Section Divider
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The most common approach is to place the SVG element directly in HTML between two
            sections with a <code>preserveAspectRatio="none"</code> attribute and{" "}
            <code>width="100%"</code>. You can also use it as a CSS <code>background-image</code>{" "}
            via a data URI — the CSS snippet shows how. For the sharpest result on all screens,
            use the inline SVG approach with <code>width="100%"</code> set on the element.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Wave Types Explained
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Gentle Sine</strong> — A standard sine wave. Smooth, organic, widely used for hero sections.
            </li>
            <li>
              <strong>Sharp</strong> — A triangle wave. Angular peaks give a geometric, modern look.
            </li>
            <li>
              <strong>Layered</strong> — Combines two sine harmonics for a more complex, natural ocean-like wave.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All SVG generation happens entirely in your browser. No data is sent to any server.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            SVG Wave Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://svg-path-editor.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                SVG Path Editor
              </a>
              <a
                href="https://svg-optimizer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                SVG Optimizer
              </a>
              <a
                href="https://css-clip-path.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSS Clip-Path
              </a>
              <a
                href="https://gradient-to-css.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Gradient to CSS
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="https://cc-tools.vercel.app"
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
