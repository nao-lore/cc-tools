import RomanNumeralConverter from "./components/RomanNumeralConverter";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Roman Numeral Converter</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Convert between Arabic numbers and Roman numerals instantly. See a
          full symbol breakdown and copy the result with one click.
        </p>

        <RomanNumeralConverter />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            How Roman Numerals Work
          </h2>
          <p>
            Roman numerals use seven letters — I, V, X, L, C, D, and M — to
            represent values from 1 to 3999. Symbols are generally written
            largest to smallest from left to right, and their values are added
            together. The exception is subtractive notation: when a smaller
            symbol precedes a larger one, the smaller value is subtracted. For
            example, IV represents 4 (5 − 1) and IX represents 9 (10 − 1).
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Subtractive Pairs
          </h2>
          <p>
            Only six subtractive combinations are standard: IV (4), IX (9), XL
            (40), XC (90), CD (400), and CM (900). Other combinations such as
            IC or VX are not valid in classical Roman numeral notation. This
            converter follows the standard rules and validates input
            accordingly.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Why the Limit of 3999?
          </h2>
          <p>
            Standard Roman numerals do not have a symbol for 5000, so the
            highest representable value with the classical alphabet is 3999
            (MMMCMXCIX). Some extended systems use an overline to multiply a
            symbol by 1000, but those are non-standard. This tool covers the
            universally accepted range of 1 to 3999.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Uses
          </h2>
          <p>
            Roman numerals appear in clock faces, book chapter headings, movie
            sequel titles, Super Bowl numbering, Olympic Games years, and
            formal document outlines. Understanding them is also a classic
            programming exercise that appears frequently in coding interviews
            and textbooks.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Roman Numeral Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="//bitwise-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Bitwise Calculator
              </a>
              <a
                href="//base-converter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Base Converter
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              More Free Tools →
            </a>
          </div>
        </div>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Roman Numeral Converter",
            description:
              "Convert between Arabic numbers and Roman numerals (1-3999). See symbol breakdown. Free online Roman numeral converter.",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </>
  );
}
