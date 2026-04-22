import DesignTokenGenerator from "./components/DesignTokenGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">color-token-generator</span>
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
            Design Token Generator
          </h1>
          <p className="text-muted text-lg">
            Build a named color palette, generate tint/shade scales, and export as CSS custom
            properties, SCSS variables, or JSON in Style Dictionary format.
          </p>
        </div>

        <DesignTokenGenerator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            What Are Design Tokens?
          </h2>
          <p>
            Design tokens are the smallest, platform-agnostic building blocks of a design system.
            They store visual design decisions — colors, spacing, typography — as named constants
            that can be consumed by any platform (CSS, iOS, Android, React Native) from a single
            source of truth.
          </p>

          <h3 className="text-lg font-semibold text-foreground">CSS Custom Properties</h3>
          <p>
            Custom properties (also called CSS variables) let you reference token values anywhere
            in your stylesheet with{" "}
            <code className="text-accent font-mono text-sm">var(--color-primary-500)</code>.
            They cascade and can be overridden per component or theme, making dark-mode
            switching trivial.
          </p>

          <h3 className="text-lg font-semibold text-foreground">SCSS Variables</h3>
          <p>
            SCSS variables are resolved at compile time, so they cannot be changed at runtime.
            Use them when you need static references, mixins, or calculations in your Sass
            stylesheets. The generated output follows the{" "}
            <code className="text-accent font-mono text-sm">$color-name-scale</code> convention.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Style Dictionary (JSON)</h3>
          <p>
            Style Dictionary is an open-source build system that transforms a JSON token file
            into any platform format. The JSON output here follows the nested category/type/item
            structure so it works out-of-the-box with{" "}
            <code className="text-accent font-mono text-sm">style-dictionary build</code>.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Tint and Shade Scales</h3>
          <p>
            Tints mix the base color with white; shades mix it with black. The 5-step scale
            maps to a 100–900 range (100 = lightest tint, 500 = base color, 900 = darkest shade),
            mirroring the convention used by Tailwind CSS and Material Design.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Design Token Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast Checker</a>
              <a href="https://css-variables-generator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Variables Generator</a>
              <a href="https://color-harmonies.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Harmonies</a>
              <a href="https://gradient-to-css.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Gradient to CSS</a>
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
