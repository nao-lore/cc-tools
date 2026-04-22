import XmlToJson from "./components/XmlToJson";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">XML to JSON Converter</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Convert XML documents to JSON. Attributes are prefixed with{" "}
          <code className="bg-[var(--muted)] px-1 rounded">@</code>, text
          content uses{" "}
          <code className="bg-[var(--muted)] px-1 rounded">#text</code>.
          Supports compact mode and array mode.
        </p>

        <XmlToJson />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            How XML to JSON Conversion Works
          </h2>
          <p>
            XML and JSON are both data interchange formats, but they have
            fundamentally different structures. XML uses a tree of elements with
            attributes, while JSON uses objects and arrays. This converter maps
            XML elements to JSON object keys, XML attributes to keys prefixed
            with{" "}
            <code className="bg-[var(--muted)] px-1 rounded">@</code> (e.g.{" "}
            <code className="bg-[var(--muted)] px-1 rounded">@id</code>), and
            text content to a{" "}
            <code className="bg-[var(--muted)] px-1 rounded">#text</code> key.
            When multiple sibling elements share the same tag name, they are
            automatically grouped into an array.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Compact Mode
          </h2>
          <p>
            In compact mode, leaf elements that contain only text content
            (no attributes, no child elements) are simplified to a plain string
            value instead of an object with a{" "}
            <code className="bg-[var(--muted)] px-1 rounded">#text</code> key.
            This produces a more readable and concise JSON output, especially
            for simple XML documents like configuration files or data feeds.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Array Mode
          </h2>
          <p>
            By default, a single child element is represented as a plain
            object. With array mode enabled, all child elements are always
            wrapped in arrays regardless of count. This is useful when
            consuming the JSON in code that expects consistent array types,
            avoiding the need to handle both object and array cases.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Handling Attributes and Namespaces
          </h2>
          <p>
            XML attributes are preserved using the{" "}
            <code className="bg-[var(--muted)] px-1 rounded">@</code> prefix
            convention, which is a widely adopted pattern (used by tools like
            xml2js and BadgerFish). Namespace prefixes in element and attribute
            names are preserved as-is in the JSON keys, so{" "}
            <code className="bg-[var(--muted)] px-1 rounded">xsi:type</code>{" "}
            becomes{" "}
            <code className="bg-[var(--muted)] px-1 rounded">@xsi:type</code>.
            The conversion runs entirely in your browser — no data is sent to
            any server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            XML to JSON Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://cc-tools.vercel.app/csv-viewer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV Viewer
              </a>
              <a
                href="https://text-diff.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Text Diff Tool
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="https://cc-tools.vercel.app"
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
            name: "XML to JSON Converter",
            description:
              "Convert XML to JSON online. Handle attributes, text content, namespaces. Pretty-print output.",
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
