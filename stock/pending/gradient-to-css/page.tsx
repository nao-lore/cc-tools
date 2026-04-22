import GradientToCss from "./components/GradientToCss";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">gradient-to-css</span>
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
            Gradient Image to CSS
          </h1>
          <p className="text-muted text-lg">
            Upload a gradient image, choose the sample axis and number of color stops, then copy the
            generated CSS <code className="text-accent font-mono text-base">linear-gradient()</code> code.
          </p>
        </div>

        <GradientToCss />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            How to Use the Gradient Image to CSS Converter
          </h2>
          <p>
            Upload any image that contains a gradient — a screenshot, a design export, or a photo.
            The tool samples colors along a straight line through the image and builds a CSS{" "}
            <code className="text-accent font-mono text-sm">linear-gradient()</code> that matches it.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Choosing an Axis</h3>
          <p>
            Select <strong>Horizontal</strong> to sample left-to-right (generates{" "}
            <code className="text-accent font-mono text-sm">to right</code>),{" "}
            <strong>Vertical</strong> for top-to-bottom, or enter a custom angle in degrees for any
            diagonal direction.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Color Stops</h3>
          <p>
            Use the slider to choose how many color stops to sample (3–20). More stops capture
            subtle transitions; fewer stops give a cleaner, simpler gradient.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Privacy</h3>
          <p>
            All processing happens entirely in your browser using the HTML5 Canvas API. No image
            data is ever sent to a server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Gradient Image to CSS — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://image-color-picker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Color Picker</a>
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast Checker</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://color-harmonies.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Harmonies</a>
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
