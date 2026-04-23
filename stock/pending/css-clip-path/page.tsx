import ClipPathGenerator from "./components/ClipPathGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">css-clip-path</span>
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
            CSS Clip-Path Generator
          </h1>
          <p className="text-muted text-lg">
            Visually create clip-path shapes. Drag points to define polygons, circles, and
            ellipses. Copy the CSS clip-path value instantly.
          </p>
        </div>

        <ClipPathGenerator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding CSS clip-path
          </h2>
          <p>
            The CSS <code className="text-accent font-mono text-sm">clip-path</code> property
            clips an element to a specific shape, hiding everything outside the defined region.
            It works on any HTML element and supports hardware-accelerated animations via the
            GPU compositor, making it ideal for reveal effects and shape transitions.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Shape Functions</h3>
          <p>
            <code className="text-accent font-mono text-sm">polygon()</code> accepts any number
            of coordinate pairs, each expressed as a percentage of the element's width and
            height. <code className="text-accent font-mono text-sm">circle()</code> takes a radius
            and an optional center point. <code className="text-accent font-mono text-sm">ellipse()</code>{" "}
            extends circle with separate horizontal and vertical radii.{" "}
            <code className="text-accent font-mono text-sm">inset()</code> defines a rectangular
            clip with optional rounded corners using the{" "}
            <code className="text-accent font-mono text-sm">round</code> keyword.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Animating clip-path</h3>
          <p>
            Browsers can interpolate between two <code className="text-accent font-mono text-sm">polygon()</code>{" "}
            values as long as they have the same number of points. This enables smooth
            morphing animations between shapes purely with CSS transitions. For circle and
            ellipse, any numeric parameter can be transitioned. Always pair clip-path animations
            with <code className="text-accent font-mono text-sm">will-change: clip-path</code>{" "}
            to hint the browser to promote the element to its own compositor layer.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Browser Support</h3>
          <p>
            <code className="text-accent font-mono text-sm">clip-path</code> with basic shapes
            is supported in all modern browsers. The{" "}
            <code className="text-accent font-mono text-sm">-webkit-clip-path</code> prefix is
            no longer required for Chrome, Firefox, Safari 13.1+, or Edge. For older Safari
            versions, add a <code className="text-accent font-mono text-sm">-webkit-clip-path</code>{" "}
            fallback with the same value.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Clip-Path Generator — Free online tool. No signup required.
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
