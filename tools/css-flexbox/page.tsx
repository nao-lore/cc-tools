import FlexboxGenerator from "./components/FlexboxGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            CSS Flexbox Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build CSS Flexbox layouts visually. Adjust container and child
            properties, see a live preview, and copy the generated CSS.
          </p>
        </div>

        {/* Flexbox Generator Tool */}
        <FlexboxGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is CSS Flexbox?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            CSS Flexible Box Layout, commonly known as Flexbox, is a CSS layout
            module designed for arranging items in one-dimensional rows or
            columns. It provides powerful alignment and distribution capabilities
            that simplify responsive design. Flexbox is supported in all modern
            browsers and is the go-to layout method for navigation bars, card
            grids, centering content, and building complex UI components.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Key Flexbox Properties
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Flexbox works by defining a <strong>flex container</strong> and its{" "}
            <strong>flex items</strong>. The container controls the overall
            layout direction and alignment, while each item can override its own
            sizing and positioning.
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>flex-direction</strong> — Sets the main axis: row, column,
              row-reverse, or column-reverse.
            </li>
            <li>
              <strong>justify-content</strong> — Aligns items along the main
              axis (e.g., center, space-between, space-around).
            </li>
            <li>
              <strong>align-items</strong> — Aligns items along the cross axis
              (e.g., stretch, center, flex-start).
            </li>
            <li>
              <strong>flex-wrap</strong> — Controls whether items wrap to new
              lines when the container overflows.
            </li>
            <li>
              <strong>gap</strong> — Adds consistent spacing between flex items
              without margins.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Flexbox Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Adjust container properties</strong> using the controls on
              the left: direction, justify-content, align-items, wrap, and gap.
            </li>
            <li>
              <strong>Add or remove child items</strong> using the buttons. You
              can have up to 10 items.
            </li>
            <li>
              <strong>Click a child item</strong> in the preview to edit its
              individual properties: flex-grow, flex-shrink, flex-basis, order,
              and align-self.
            </li>
            <li>
              <strong>See the live CSS output</strong> update in real time as you
              change any property.
            </li>
            <li>
              <strong>Copy the CSS</strong> with one click and paste it into your
              stylesheet.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Flexbox Patterns
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Centering an element</strong> — Set justify-content and
              align-items both to center on the container.
            </li>
            <li>
              <strong>Equal-width columns</strong> — Give each child flex-grow: 1
              and flex-basis: 0.
            </li>
            <li>
              <strong>Sticky footer</strong> — Use flex-direction: column on a
              full-height container with flex-grow: 1 on the main content area.
            </li>
            <li>
              <strong>Navigation bar</strong> — Use flex-direction: row with
              justify-content: space-between for logo and links.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">css-flexbox — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-grid-two-mocha.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Grid</a>
              <a href="https://css-animation-tawny.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Animation</a>
              <a href="https://tailwindconvert.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Convert</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
              <a href="https://css-box-shadow-gamma.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools &rarr;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
