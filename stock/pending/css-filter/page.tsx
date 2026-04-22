import CssFilterGenerator from "./components/CssFilterGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">css-filter</span>
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
            CSS Filter Generator
          </h1>
          <p className="text-muted text-lg">
            Create CSS filter effects visually with sliders. Apply blur, brightness,
            contrast, and more. Copy the generated CSS instantly.
          </p>
        </div>

        <CssFilterGenerator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding CSS Filters
          </h2>
          <p>
            The CSS <code className="text-accent font-mono text-sm">filter</code> property
            applies visual effects to elements. Filters are composited in order, so the
            result of one filter feeds into the next. They work on any HTML element
            including images, videos, and entire sections of a page.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Common Filter Functions</h3>
          <p>
            <code className="text-accent font-mono text-sm">blur()</code> softens the element
            using a Gaussian blur. <code className="text-accent font-mono text-sm">brightness()</code>{" "}
            and <code className="text-accent font-mono text-sm">contrast()</code> adjust luminance
            and tonal range. <code className="text-accent font-mono text-sm">grayscale()</code> and{" "}
            <code className="text-accent font-mono text-sm">sepia()</code> shift color channels
            to monochrome or warm vintage tones. <code className="text-accent font-mono text-sm">hue-rotate()</code>{" "}
            rotates all hues by a given angle on the color wheel.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Compositing Order</h3>
          <p>
            Because filters are applied left to right, order matters. For example,
            applying <code className="text-accent font-mono text-sm">brightness(2)</code> before{" "}
            <code className="text-accent font-mono text-sm">grayscale(1)</code> produces a
            different result than reversing them. This generator combines all active
            filters into a single <code className="text-accent font-mono text-sm">filter</code> declaration
            for maximum performance — one compositing pass in the browser.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Performance Tips</h3>
          <p>
            CSS filters trigger GPU compositing, which is fast, but overusing them on
            large elements or many elements can cause repaints. Prefer applying filters
            to a wrapper div over applying them to individual small elements. The{" "}
            <code className="text-accent font-mono text-sm">will-change: filter</code> property
            hints to the browser to promote the element to its own compositor layer,
            reducing repaint costs on animations.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Browser Support</h3>
          <p>
            CSS filters are supported in all modern browsers. The{" "}
            <code className="text-accent font-mono text-sm">-webkit-filter</code> prefix
            is no longer required for Chrome, Firefox, Safari, or Edge. For legacy
            Safari versions before 9.1, add a{" "}
            <code className="text-accent font-mono text-sm">-webkit-filter</code> fallback
            with the same value.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Filter Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://css-box-shadow-gamma.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
              <a href="https://color-palette-sand.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
              <a href="https://css-animation-tawny.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Animation</a>
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
