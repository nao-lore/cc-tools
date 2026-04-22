import SvgPathEditor from "./components/SvgPathEditor";

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
            SVG Path Editor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Edit SVG path <code className="font-mono text-sm bg-gray-100 px-1 rounded">d</code>-attribute commands visually.
            Drag control points on the canvas, edit coordinates in the panel, and see changes in real-time.
          </p>
        </div>

        {/* Tool */}
        <SvgPathEditor />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is an SVG Path?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            An SVG path is defined by a series of commands in the <code>d</code> attribute of a{" "}
            <code>&lt;path&gt;</code> element. Commands like <strong>M</strong> (move to),{" "}
            <strong>L</strong> (line to), <strong>C</strong> (cubic Bezier curve),{" "}
            <strong>Q</strong> (quadratic Bezier), <strong>A</strong> (arc), and{" "}
            <strong>Z</strong> (close path) combine to describe any 2D shape.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Editor
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Paste a d-string</strong> into the input or choose a sample preset.
            </li>
            <li>
              <strong>Edit coordinates</strong> in the command panel on the right — changes update the canvas instantly.
            </li>
            <li>
              <strong>Drag control points</strong> directly on the SVG canvas to move them.
            </li>
            <li>
              <strong>Copy the d-string</strong> with the Copy button when done.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Path Commands
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li><strong>M / m</strong> — Move to (absolute / relative)</li>
            <li><strong>L / l</strong> — Line to (absolute / relative)</li>
            <li><strong>H / h</strong> — Horizontal line to</li>
            <li><strong>V / v</strong> — Vertical line to</li>
            <li><strong>C / c</strong> — Cubic Bezier curve</li>
            <li><strong>Q / q</strong> — Quadratic Bezier curve</li>
            <li><strong>A / a</strong> — Elliptical arc</li>
            <li><strong>Z / z</strong> — Close path</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All processing happens entirely in your browser. No path data is sent to any server.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            SVG Path Editor — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
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
                href="https://color-contrast-checker.vercel.app"
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
