import BorderRadiusGenerator from "./components/BorderRadiusGenerator";

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
            CSS Border Radius Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visually design rounded corners for any element. Adjust each corner
            independently, use elliptical radii, and copy the CSS instantly.
          </p>
        </div>

        {/* Generator Tool */}
        <BorderRadiusGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is CSS Border Radius?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The CSS <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">border-radius</code> property
            defines the curvature of an element&apos;s corners. It accepts one to four values
            to control each corner individually. When a single value is provided, all four
            corners share the same radius. With four values, they map to top-left, top-right,
            bottom-right, and bottom-left in clockwise order.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Border Radius Syntax
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The shorthand property supports several formats:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`/* Single value — all corners */
border-radius: 10px;

/* Two values — top-left/bottom-right, top-right/bottom-left */
border-radius: 10px 20px;

/* Four values — each corner */
border-radius: 10px 20px 30px 40px;

/* Elliptical — horizontal / vertical */
border-radius: 10px 20px 30px 40px / 5px 10px 15px 20px;`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Drag the sliders</strong> to set the radius for each corner.
              Use the Link toggle to move all corners together.
            </li>
            <li>
              <strong>Enable Elliptical mode</strong> to control horizontal and
              vertical radii independently for each corner.
            </li>
            <li>
              <strong>Switch units</strong> between px, %, and em depending on your
              use case.
            </li>
            <li>
              <strong>Try a preset</strong> like pill, circle, blob, leaf, or egg
              to quickly explore common shapes.
            </li>
            <li>
              <strong>Copy the CSS</strong> with one click and paste it into your
              stylesheet.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Border Radius Patterns
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Pill shape:</strong> Set a large border-radius (e.g. 9999px)
              on a rectangular element. The radius is clamped to half the shorter
              side, creating a capsule shape.
            </li>
            <li>
              <strong>Circle:</strong> Use <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">border-radius: 50%</code> on
              a square element.
            </li>
            <li>
              <strong>Organic blobs:</strong> Combine elliptical radii with different
              horizontal and vertical values for each corner.
            </li>
            <li>
              <strong>Leaf or drop shapes:</strong> Set two diagonal corners to
              zero and the other two to a high value.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browser Support
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">border-radius</code> property
            is supported in all modern browsers including Chrome, Firefox, Safari, Edge, and
            Opera. No vendor prefixes are needed. It works reliably on both desktop and mobile
            browsers, making it safe for production use without fallbacks.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Border Radius Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/css-box-shadow" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow Generator</a>
              <a href="/css-gradient" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient Generator</a>
              <a href="/css-flexbox" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Flexbox Generator</a>
              <a href="/css-animation" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Animation Generator</a>
              <a href="/color-palette" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
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
