import CssTransformBuilder from "./components/CssTransformBuilder";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">css-transform</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            CSS Transform Builder
          </h1>
          <p className="text-muted text-lg">
            Build CSS transform functions visually. Translate, rotate, scale, and skew
            with sliders and see live results. Copy the CSS transform instantly.
          </p>
        </div>

        <CssTransformBuilder />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding CSS Transforms
          </h2>
          <p>
            The CSS <code className="text-accent font-mono text-sm">transform</code> property
            lets you visually reposition, resize, rotate, or distort an element without
            affecting document flow. Transforms are composited on the GPU, making them
            far cheaper than changing layout properties like <code className="text-accent font-mono text-sm">top</code>,{" "}
            <code className="text-accent font-mono text-sm">left</code>, or <code className="text-accent font-mono text-sm">width</code>.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Transform Functions</h3>
          <p>
            <code className="text-accent font-mono text-sm">translate(x, y)</code> moves
            an element along the X and Y axes without affecting surrounding elements.{" "}
            <code className="text-accent font-mono text-sm">rotate(deg)</code> spins the
            element clockwise around its transform origin.{" "}
            <code className="text-accent font-mono text-sm">scale(x, y)</code> enlarges
            or shrinks the element — values below 1 shrink, above 1 grow, and negative
            values mirror the element.{" "}
            <code className="text-accent font-mono text-sm">skew(x, y)</code> tilts the
            element along each axis.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Perspective and 3D</h3>
          <p>
            Adding <code className="text-accent font-mono text-sm">perspective()</code> as
            the first function enables a 3D viewing distance. Lower values (e.g. 200px)
            create an exaggerated perspective effect; higher values (e.g. 2000px) appear
            nearly flat. Perspective must be listed before any 3D rotation functions to
            take effect.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Order Matters</h3>
          <p>
            Transform functions are applied right to left in the element's local coordinate
            system. <code className="text-accent font-mono text-sm">translate(50px, 0) rotate(45deg)</code>{" "}
            rotates first then translates along the rotated axis, while reversing the order
            translates in the original axis then rotates. This builder outputs transforms in
            a predictable order: perspective → translate → rotate → scale → skew.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Performance Tips</h3>
          <p>
            CSS transforms trigger compositing rather than layout or paint, so they are
            ideal for animations. Use{" "}
            <code className="text-accent font-mono text-sm">will-change: transform</code>{" "}
            to promote an element to its own GPU layer before animating. Avoid animating
            transforms on dozens of elements simultaneously — batch them or use a single
            wrapper element instead.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Transform Builder — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="/css-box-shadow" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
              <a href="/border-radius" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
              <a href="/css-animation" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Animation</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
