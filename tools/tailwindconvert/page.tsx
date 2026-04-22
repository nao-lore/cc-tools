import Converter from "./components/Converter";
import PatternsTable from "./components/PatternsTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-6 h-6 text-indigo-600"
            >
              <path d="M16 18l2-2-2-2" />
              <path d="M8 6L6 8l2 2" />
              <path d="m14.5 4-5 16" />
            </svg>
            <span className="font-bold text-lg text-gray-900">
              tailwindconvert
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-4 pt-12 pb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Tailwind CSS Converter
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Convert between plain CSS and Tailwind CSS utility classes instantly.
            Bidirectional, free, and runs entirely in your browser.
          </p>
          <p className="text-sm text-gray-400">
            No data sent to any server &mdash; 100% client-side conversion
          </p>
        </section>

        {/* Converter Tool */}
        <section className="px-4 pb-16">
          <Converter />
        </section>

        {/* AdSense Placeholder */}
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <div
            className="w-full h-24 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm"
            data-ad-slot="placeholder"
          >
            Ad Space
          </div>
        </div>

        {/* Common Patterns */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Common CSS to Tailwind Patterns
          </h2>
          <p className="text-gray-600 mb-6">
            Quick reference table for the most frequently used CSS properties and
            their Tailwind CSS equivalents.
          </p>
          <PatternsTable />
        </section>

        {/* SEO Content */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Use a Tailwind CSS Converter?
            </h2>

            <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
              <h3 className="text-xl font-semibold text-gray-800">
                What is Tailwind CSS?
              </h3>
              <p>
                Tailwind CSS is a utility-first CSS framework that provides
                low-level utility classes to build custom designs without writing
                traditional CSS. Instead of writing{" "}
                <code className="text-sm bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                  display: flex; justify-content: center;
                </code>
                , you simply add{" "}
                <code className="text-sm bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                  flex justify-center
                </code>{" "}
                as CSS classes directly in your HTML. This approach speeds up
                development, reduces CSS file size through purging unused styles,
                and makes it easy to maintain consistent designs across large
                projects.
              </p>

              <h3 className="text-xl font-semibold text-gray-800">
                Why Convert CSS to Tailwind?
              </h3>
              <p>
                Converting existing CSS to Tailwind utility classes is one of the
                most common tasks when migrating a project to Tailwind CSS. If
                you have an existing codebase with traditional stylesheets, a CSS
                to Tailwind converter helps you quickly translate your styles
                into utility classes. This is especially useful when refactoring
                legacy code, onboarding new team members who are learning
                Tailwind, or when you find a CSS snippet online and want to use
                it in your Tailwind project.
              </p>

              <h3 className="text-xl font-semibold text-gray-800">
                Why Convert Tailwind to CSS?
              </h3>
              <p>
                The reverse direction is equally valuable. Sometimes you need to
                understand what CSS a Tailwind class actually generates, or you
                need to extract styles from a Tailwind project into plain CSS for
                use in a non-Tailwind environment. A Tailwind to CSS converter
                lets you quickly see the underlying CSS properties for any
                combination of utility classes. This is helpful for debugging,
                learning, and for projects that need to support both Tailwind and
                traditional CSS workflows.
              </p>

              <h3 className="text-xl font-semibold text-gray-800">
                How This Tool Works
              </h3>
              <p>
                This Tailwind CSS converter runs entirely in your browser. It
                uses a comprehensive mapping dictionary covering the most common
                CSS properties and their Tailwind equivalents, including layout,
                spacing, typography, colors, borders, shadows, flexbox, grid, and
                more. Simply paste your CSS or Tailwind classes in the input
                panel, and the converted output appears instantly. The converter
                handles selectors, nested rules, and shorthand properties. For
                any CSS property that does not have a direct Tailwind equivalent,
                it shows a helpful comment so you know which properties need
                manual conversion.
              </p>

              <h3 className="text-xl font-semibold text-gray-800">
                Supported Properties
              </h3>
              <p>
                The converter supports over 60 of the most commonly used CSS
                properties, including display, position, padding, margin, width,
                height, font-size, font-weight, color, background-color,
                border-radius, box-shadow, flexbox properties like
                justify-content and align-items, grid properties like
                grid-template-columns and col-span, overflow, opacity, cursor,
                z-index, transitions, and many more. The spacing system
                accurately maps pixel and rem values to Tailwind&#39;s spacing scale.
              </p>

              <h3 className="text-xl font-semibold text-gray-800">
                Tips for Using the Converter
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You can paste full CSS rules with selectors, or just bare
                  property declarations without selectors.
                </li>
                <li>
                  Use the mode toggle button to switch between CSS-to-Tailwind
                  and Tailwind-to-CSS directions.
                </li>
                <li>
                  Click the Copy button to quickly copy the output to your
                  clipboard.
                </li>
                <li>
                  Check the reference table below the converter for common
                  patterns you can memorize over time.
                </li>
                <li>
                  For responsive designs, remember that Tailwind uses prefix
                  modifiers like{" "}
                  <code className="text-sm bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                    sm:
                  </code>{" "}
                  ,{" "}
                  <code className="text-sm bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                    md:
                  </code>{" "}
                  , and{" "}
                  <code className="text-sm bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                    lg:
                  </code>{" "}
                  instead of media queries.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            tailwindconvert — Free CSS to Tailwind and Tailwind to CSS converter tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-flexbox-rho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Flexbox</a>
              <a href="https://css-grid-two-mocha.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Grid</a>
              <a href="https://css-gradient-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://px-to-rem-rust.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">PX to REM</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Tailwind CSS Converter",
            url: "https://tailwindconvert.com",
            description:
              "Free online tool to convert between CSS and Tailwind CSS utility classes. Bidirectional conversion, runs entirely in your browser.",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "CSS to Tailwind conversion",
              "Tailwind to CSS conversion",
              "Live conversion as you type",
              "Copy to clipboard",
              "Common patterns reference",
              "60+ CSS properties supported",
              "100% client-side",
            ],
          }),
        }}
      />
    </div>
  );
}
