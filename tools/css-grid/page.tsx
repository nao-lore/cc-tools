import GridGenerator from "./components/GridGenerator";

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
            CSS Grid Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visually build CSS Grid layouts. Configure columns, rows, gaps, and
            template areas, then copy production-ready CSS.
          </p>
        </div>

        {/* Grid Generator Tool */}
        <GridGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is CSS Grid?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            CSS Grid is a two-dimensional layout system built into modern
            browsers. It lets you define rows and columns in a container and
            place child elements precisely within that grid. Unlike Flexbox,
            which operates in a single axis, CSS Grid handles both horizontal
            and vertical layout simultaneously, making it ideal for complex page
            structures.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Key CSS Grid Properties
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The core properties you need to understand:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>grid-template-columns</strong> — Defines the number and
              size of columns. Use <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">fr</code> units
              for flexible fractions, <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">px</code> for
              fixed sizes, or <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">auto</code> to size
              based on content.
            </li>
            <li>
              <strong>grid-template-rows</strong> — Same as columns but for row
              sizing.
            </li>
            <li>
              <strong>gap</strong> — Sets spacing between grid cells. You can
              set <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">row-gap</code> and{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">column-gap</code> independently.
            </li>
            <li>
              <strong>grid-template-areas</strong> — Name regions of your grid
              for semantic, readable layouts. Each cell gets an area name, and
              identical adjacent names merge into a single region.
            </li>
            <li>
              <strong>grid-column / grid-row span</strong> — Let individual
              items stretch across multiple columns or rows.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This CSS Grid Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Choose a preset</strong> or start from scratch. Presets
              like Holy Grail, Dashboard, Gallery, and Sidebar Layout give you
              a head start.
            </li>
            <li>
              <strong>Configure columns and rows</strong> by adjusting the
              number, size values, and units (fr, px, auto).
            </li>
            <li>
              <strong>Set gap values</strong> for row-gap and column-gap to
              control spacing between cells.
            </li>
            <li>
              <strong>Enable template areas</strong> and click cells in the
              preview to name grid regions. Adjacent cells with the same name
              merge visually.
            </li>
            <li>
              <strong>Copy the generated CSS</strong> and paste it into your
              stylesheet. The output includes the container rules and
              area-specific selectors.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Grid Layout Patterns
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <strong>Holy Grail</strong> layout features a header, footer,
            main content area, and two sidebars. The{" "}
            <strong>Sidebar Layout</strong> pairs a fixed-width navigation panel
            with a fluid content area. <strong>Dashboard</strong> layouts use a
            sidebar with a grid of cards. <strong>Gallery</strong> layouts
            arrange items in a multi-column grid with spanning items for visual
            variety. All of these are achievable with a few CSS Grid properties
            and are included as presets in this tool.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            CSS Grid vs Flexbox
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Use CSS Grid for two-dimensional layouts where you need to control
            both rows and columns. Use Flexbox for one-dimensional layouts like
            navigation bars, button groups, or vertically stacking elements.
            Many modern designs combine both: Grid for the overall page
            structure and Flexbox for component-level alignment within grid
            cells.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">CSS Grid Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-flexbox-rho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Flexbox Generator</a>
              <a href="https://css-animation-tawny.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Animation Generator</a>
              <a href="https://tailwindconvert.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Converter</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius Generator</a>
              <a href="https://css-box-shadow-gamma.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
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
