import UnicodeInspector from "./components/UnicodeInspector";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Unicode Inspector</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Inspect every character in a string: codepoint, Unicode name,
          category, UTF-8 bytes, and byte count. Invisible and control
          characters are highlighted in red.
        </p>

        <UnicodeInspector />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is a Unicode Codepoint?
          </h2>
          <p>
            Every character in the Unicode standard is assigned a unique
            numerical identifier called a codepoint, written as U+XXXX. For
            example, the letter A is U+0041, the Euro sign € is U+20AC, and the
            snowman ☃ is U+2603. There are over 1.1 million possible codepoints,
            of which around 150,000 are currently assigned.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Unicode Categories
          </h2>
          <p>
            Each codepoint belongs to a general category: <strong>Letter</strong>{" "}
            (L) covers alphabetic characters, <strong>Digit</strong> (Nd) covers
            decimal digits, <strong>Punctuation</strong> (P) covers marks like
            commas and periods, <strong>Symbol</strong> (S) covers currency signs
            and mathematical symbols, <strong>Separator</strong> (Z) covers
            spaces and line separators, and <strong>Control</strong> (C) covers
            invisible control codes. Detecting unexpected categories in user
            input is useful for security and data validation.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            UTF-8 Encoding
          </h2>
          <p>
            UTF-8 is the dominant encoding on the web. It represents each
            codepoint as one to four bytes. ASCII characters (U+0000–U+007F) use
            a single byte, making UTF-8 backward-compatible with ASCII. Characters
            in the range U+0080–U+07FF use two bytes, U+0800–U+FFFF use three
            bytes, and supplementary characters (U+10000 and above, such as most
            emoji) use four bytes.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Invisible and Dangerous Characters
          </h2>
          <p>
            Some Unicode characters are invisible or look identical to common
            characters but have different codepoints. Zero-width spaces (U+200B),
            zero-width non-joiners (U+200C), bidirectional override characters
            (U+202E), and various other control characters can cause security
            issues, broken comparisons, and display problems. This tool highlights
            them in red so you can detect them immediately.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <p>
            Debugging encoding problems in APIs, detecting homoglyph attacks in
            user input, verifying text copied from PDFs or websites, understanding
            why string length comparisons fail, inspecting emoji and combining
            characters, and auditing user-submitted content for invisible
            characters. All processing runs in your browser — no data is sent to
            a server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Unicode Inspector — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://ascii-table-generator.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                ASCII Table Generator
              </a>
              <a
                href="https://diff-viewer.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
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
              53+ Free Tools →
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
            name: "Unicode Inspector",
            description:
              "Inspect Unicode characters: codepoint, name, category, UTF-8 bytes. Detect invisible and unusual characters. Free online tool.",
            applicationCategory: "DeveloperApplication",
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
