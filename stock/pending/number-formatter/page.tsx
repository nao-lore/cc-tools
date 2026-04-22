import NumberFormatter from "./components/NumberFormatter";

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
            Number Formatter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Format numbers with locale-specific separators, currency symbols, and
            units using the browser&apos;s built-in{" "}
            <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">
              Intl.NumberFormat
            </code>{" "}
            API. See the exact JavaScript code that produces each result.
          </p>
        </div>

        {/* Tool */}
        <NumberFormatter />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is Intl.NumberFormat?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <code>Intl.NumberFormat</code> is a built-in JavaScript API that
            formats numbers according to locale conventions. Rather than
            hard-coding separators like commas and periods, you pass a BCP 47
            locale tag (such as <code>en-US</code> or <code>de-DE</code>) and the
            browser applies the correct grouping separator, decimal separator,
            currency symbol placement, and numeral system for that locale.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Decimal, Currency, Percent, and Unit Styles
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <code>style</code> option controls the overall format mode.{" "}
            <strong>decimal</strong> formats a plain number with locale-aware
            thousands and decimal separators. <strong>currency</strong> prepends
            or appends a currency symbol or ISO code — its position depends on
            the locale. <strong>percent</strong> multiplies the value by 100 and
            appends the percent sign. <strong>unit</strong> appends an SI or
            imperial unit label, adapting it to singular or plural as needed.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Notation Options
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <code>notation</code> option changes how the magnitude is
            expressed. <strong>standard</strong> is the default full number.{" "}
            <strong>scientific</strong> uses <em>×10^n</em> form.{" "}
            <strong>engineering</strong> is similar but always uses exponents that
            are multiples of three, matching SI prefixes. <strong>compact</strong>{" "}
            abbreviates large numbers — for example, 1.2M for 1,200,000 — which
            is common in dashboards and data visualisations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Fraction Digits and Sign Display
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <code>minimumFractionDigits</code> and{" "}
            <code>maximumFractionDigits</code> control how many decimal places are
            shown. Setting both to 0 produces an integer. Setting minimum to 2
            always pads to two places (useful for currency). The{" "}
            <code>signDisplay</code> option controls when the + or − sign
            appears: <strong>auto</strong> shows the minus for negatives only,{" "}
            <strong>always</strong> shows both signs, <strong>never</strong>{" "}
            hides the sign entirely, and <strong>exceptZero</strong> shows the
            sign for all non-zero values.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>E-commerce</strong> — display prices in the user&apos;s
              local currency format without manual string concatenation.
            </li>
            <li>
              <strong>Analytics dashboards</strong> — compact notation (1.2M,
              4.5B) saves space in charts and KPI tiles.
            </li>
            <li>
              <strong>Science and engineering apps</strong> — scientific notation
              communicates precision and magnitude clearly.
            </li>
            <li>
              <strong>Internationalisation (i18n)</strong> — a single API call
              handles grouping separators that differ across locales (comma in
              en-US, period in de-DE, space in fr-FR).
            </li>
            <li>
              <strong>Unit conversion tools</strong> — attach SI labels like km,
              kg, or °C with automatic pluralisation.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Number Formatter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://unit-converter-sage.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
              <a href="https://timestamp-converter-jp.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timestamp Converter</a>
              <a href="https://bitwise-calculator-delta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Bitwise Calculator</a>
              <a href="https://base64-tools-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="https://css-filter-preview.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter Preview</a>
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
