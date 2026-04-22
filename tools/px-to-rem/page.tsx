import PxRemConverter from "./components/PxRemConverter";

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
            PX to REM Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert pixels to rem and rem to pixels instantly. Set your base font
            size, use the quick reference table, or bulk convert multiple values.
          </p>
        </div>

        {/* Converter Tool */}
        <PxRemConverter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are PX and REM Units?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            In CSS, <strong>px</strong> (pixels) is an absolute unit that
            represents a fixed size on screen. <strong>rem</strong> (root em) is
            a relative unit based on the root element&apos;s font size, which
            defaults to 16px in most browsers. Using rem units makes your
            designs more accessible and responsive because they scale with the
            user&apos;s font size preferences.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Convert PX to REM
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The formula is straightforward:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
            {`rem = px / base-font-size\n\nExample: 24px / 16px = 1.5rem`}
          </pre>
          <p className="text-gray-700 leading-relaxed mb-4">
            If your base font size is 16px (the browser default), then 16px
            equals 1rem, 32px equals 2rem, and 8px equals 0.5rem. Change the
            base font size above if your project uses a different root size.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Use REM Instead of PX?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Accessibility:</strong> REM units respect the user&apos;s
              browser font size settings, making your site more accessible to
              users who need larger text.
            </li>
            <li>
              <strong>Scalability:</strong> Changing the root font size
              automatically scales all rem-based values throughout your
              stylesheet.
            </li>
            <li>
              <strong>Responsive design:</strong> REM units work well with media
              queries and fluid layouts, making it easier to create responsive
              designs.
            </li>
            <li>
              <strong>Consistency:</strong> Using a single relative unit creates
              a more predictable and maintainable spacing system.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            When to Use PX vs REM
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Use <strong>rem</strong> for font sizes, padding, margins, and most
            layout spacing. Use <strong>px</strong> for borders, box shadows, and
            fine details that should not scale with font size. Many CSS
            frameworks and design systems use rem as the default unit for sizing
            to ensure consistent scaling across different devices and user
            preferences.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common PX to REM Conversions
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            With a 16px base: 12px = 0.75rem, 14px = 0.875rem, 16px = 1rem,
            18px = 1.125rem, 20px = 1.25rem, 24px = 1.5rem, 32px = 2rem, 48px =
            3rem, and 64px = 4rem. Use the quick reference table above for
            instant lookups with your custom base size.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">PX to REM Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://tailwindconvert.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Converter</a>
              <a href="https://css-flexbox-rho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Flexbox</a>
              <a href="https://css-grid-two-mocha.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Grid</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
              <a href="https://color-converter-inky.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Converter</a>
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
