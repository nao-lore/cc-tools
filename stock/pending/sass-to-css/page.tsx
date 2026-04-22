import SassConverter from "./components/SassConverter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#cc6699] to-[#6366f1]" />
            <span className="font-semibold text-foreground">sass-to-css</span>
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
            SASS/SCSS to CSS Converter
          </h1>
          <p className="text-muted text-lg">
            Convert SCSS code to plain CSS instantly. Handles nesting, variables,
            and basic math. Runs entirely in your browser — no data sent anywhere.
          </p>
        </div>

        <SassConverter />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            What This Converter Supports
          </h2>
          <p>
            This tool compiles a practical subset of SCSS syntax to standard CSS.
            It handles the three features that cover the vast majority of real-world
            SCSS usage: variables, nesting, and inline arithmetic.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Variables</h3>
          <p>
            Declare variables with a{" "}
            <code className="text-accent font-mono text-sm">$</code> prefix and
            reference them anywhere in the file. Variable values are resolved before
            compilation, so you can reference one variable inside another.
            For example,{" "}
            <code className="text-accent font-mono text-sm">$primary: #6366f1;</code>{" "}
            and then use{" "}
            <code className="text-accent font-mono text-sm">color: $primary;</code>{" "}
            anywhere in your rules.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Nesting</h3>
          <p>
            Nest selectors inside parent rules to express hierarchy without
            repeating selectors. The compiler concatenates parent and child
            selectors with a space. Use the{" "}
            <code className="text-accent font-mono text-sm">&</code> parent
            reference to attach pseudo-classes or modifiers directly:{" "}
            <code className="text-accent font-mono text-sm">&:hover</code> compiles
            to{" "}
            <code className="text-accent font-mono text-sm">.parent:hover</code>.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Basic Math</h3>
          <p>
            SCSS supports arithmetic on numeric values. This converter handles
            simple binary expressions like{" "}
            <code className="text-accent font-mono text-sm">$padding / 2</code> or{" "}
            <code className="text-accent font-mono text-sm">14px * 1.5</code>.
            The unit from the expression is preserved in the output. For more
            complex math involving mixed units, use CSS{" "}
            <code className="text-accent font-mono text-sm">calc()</code> instead.
          </p>

          <h3 className="text-lg font-semibold text-foreground">
            When to Use a Real Compiler
          </h3>
          <p>
            For production builds, use the official Dart Sass compiler via{" "}
            <code className="text-accent font-mono text-sm">sass</code> CLI or
            a bundler plugin. This tool is designed for quick checks, learning,
            and sharing snippets — it does not support mixins, functions, extend,
            or at-rules like{" "}
            <code className="text-accent font-mono text-sm">@use</code> and{" "}
            <code className="text-accent font-mono text-sm">@forward</code>.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            SASS/SCSS to CSS Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://tailwindconvert.com" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Converter</a>
              <a href="https://css-gradient-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
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
