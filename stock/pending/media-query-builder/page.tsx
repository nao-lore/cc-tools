import MediaQueryBuilder from "./components/MediaQueryBuilder";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">media-query-builder</span>
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
            CSS Media Query Builder
          </h1>
          <p className="text-muted text-lg">
            Build responsive CSS media queries visually. Add conditions, combine with and/or,
            preview which devices match, and copy the generated rule instantly.
          </p>
        </div>

        <MediaQueryBuilder />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding CSS Media Queries
          </h2>
          <p>
            Media queries let you apply CSS rules conditionally based on device characteristics.
            The <code className="text-accent font-mono text-sm">@media</code> rule tests one or
            more conditions and applies styles only when those conditions are true.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Combining Conditions</h3>
          <p>
            Use <code className="text-accent font-mono text-sm">and</code> to require all
            conditions to be true simultaneously — for example, a screen that is both wider than
            768px and in landscape orientation. Use a comma (treated as{" "}
            <code className="text-accent font-mono text-sm">or</code>) to apply styles when any
            one condition matches.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Breakpoint Conventions</h3>
          <p>
            Tailwind CSS uses five default breakpoints: <code className="text-accent font-mono text-sm">sm</code> (640px),{" "}
            <code className="text-accent font-mono text-sm">md</code> (768px),{" "}
            <code className="text-accent font-mono text-sm">lg</code> (1024px),{" "}
            <code className="text-accent font-mono text-sm">xl</code> (1280px), and{" "}
            <code className="text-accent font-mono text-sm">2xl</code> (1536px). These map to
            common device widths and are a good starting point for responsive layouts.
          </p>

          <h3 className="text-lg font-semibold text-foreground">User Preference Queries</h3>
          <p>
            <code className="text-accent font-mono text-sm">prefers-color-scheme</code> detects
            whether the user has set their OS to light or dark mode.{" "}
            <code className="text-accent font-mono text-sm">prefers-reduced-motion</code> respects
            accessibility settings for users who are sensitive to animations. These queries make
            your site more inclusive without requiring JavaScript.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Pointer and Hover</h3>
          <p>
            <code className="text-accent font-mono text-sm">hover: hover</code> targets devices
            with a pointing device that supports hover (typically a mouse).{" "}
            <code className="text-accent font-mono text-sm">pointer: coarse</code> targets touch
            screens, while <code className="text-accent font-mono text-sm">pointer: fine</code>{" "}
            targets mice and styluses. Use these to tailor interactive elements for touch vs.
            pointer-based interaction.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Media Query Builder — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="/css-box-shadow" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
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
