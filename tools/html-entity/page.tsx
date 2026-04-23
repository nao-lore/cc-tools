import HtmlEntity from "./components/HtmlEntity";

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
            HTML Entity Encoder / Decoder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert text to HTML entities or decode entities back to readable
            characters. Supports named, numeric, and hexadecimal entities.
          </p>
        </div>

        {/* Tool */}
        <HtmlEntity />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are HTML Entities?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            HTML entities are special sequences used to represent characters that
            have a reserved meaning in HTML or characters that cannot be easily
            typed on a keyboard. For example, the less-than sign (&lt;) is
            written as <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;lt;</code> to
            prevent the browser from interpreting it as an HTML tag. Entities
            start with an ampersand (&amp;) and end with a semicolon (;).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Named vs Numeric Entities
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Named entities use a human-readable name
            like <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;copy;</code> for
            the copyright symbol. Numeric entities use the Unicode code point in
            decimal (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;#169;</code>)
            or hexadecimal (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;#xA9;</code>)
            form. Numeric entities can represent any Unicode character, while
            named entities are limited to a predefined set.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            When to Encode HTML Entities
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Preventing XSS attacks</strong> — Encoding user input
              before rendering it in HTML prevents malicious script injection.
            </li>
            <li>
              <strong>Displaying code snippets</strong> — When showing HTML
              source code on a webpage, entities prevent the browser from
              interpreting the tags.
            </li>
            <li>
              <strong>Special characters in content</strong> — Characters like
              &amp;, &lt;, &gt;, and &quot; must be encoded to display correctly
              in HTML documents.
            </li>
            <li>
              <strong>Email obfuscation</strong> — Encoding email addresses as
              entities can help reduce spam harvesting.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Choose a mode</strong> — Select Encode to convert text to
              entities, or Decode to convert entities back to text.
            </li>
            <li>
              <strong>Paste your text</strong> — Enter the content you want to
              convert in the input area.
            </li>
            <li>
              <strong>Configure options</strong> — Choose between named or
              numeric entities, and whether to encode all characters or only
              special ones.
            </li>
            <li>
              <strong>Copy the result</strong> — Click the copy button to copy
              the converted output to your clipboard.
            </li>
            <li>
              <strong>Use the reference table</strong> — Browse or search common
              HTML entities. Click any entity to copy it instantly.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common HTML Entities
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The most frequently used HTML entities include <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;amp;</code> for
            the ampersand, <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;lt;</code> and <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;gt;</code> for
            angle brackets, <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;quot;</code> for
            double quotes, and <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&amp;nbsp;</code> for
            non-breaking spaces. Beyond these basics, HTML supports entities
            for currency symbols, mathematical operators, arrows, Greek letters,
            and many other special characters.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">html-entity — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/url-encoder" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">URL Encoder</a>
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/html-to-markdown" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML to Markdown</a>
              <a href="/minify-js" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Minify JS</a>
              <a href="/xml-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">XML Formatter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
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
