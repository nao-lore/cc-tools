import JsonToTypescript from "./components/JsonToTypescript";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">JSON to TypeScript Interface Generator</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Paste any JSON and instantly generate TypeScript interfaces. Handles nested
          objects, arrays, null values, and mixed-type arrays. All processing runs
          entirely in your browser.
        </p>

        <JsonToTypescript />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is a TypeScript Interface?
          </h2>
          <p>
            A TypeScript interface defines the shape of an object — its property names
            and their types. Interfaces are purely a compile-time construct: they
            disappear after transpilation and add zero runtime overhead. They are
            widely used to type API responses, configuration objects, and data models
            in React, Node.js, and any TypeScript project.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            How the Generator Works
          </h2>
          <p>
            The tool parses your JSON and infers a TypeScript type for each value.
            Primitives map to{" "}
            <code className="bg-[var(--muted)] px-1 rounded">string</code>,{" "}
            <code className="bg-[var(--muted)] px-1 rounded">number</code>, or{" "}
            <code className="bg-[var(--muted)] px-1 rounded">boolean</code>. Nested
            objects become sub-interfaces. Arrays are typed as{" "}
            <code className="bg-[var(--muted)] px-1 rounded">T[]</code> where{" "}
            <code className="bg-[var(--muted)] px-1 rounded">T</code> is inferred from
            the element types — mixed-type arrays become union types. Null values
            produce union types with{" "}
            <code className="bg-[var(--muted)] px-1 rounded">null</code>.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Options Explained
          </h2>
          <p>
            <strong>Root interface name</strong> controls the name of the top-level
            generated interface. <strong>Export</strong> prepends the{" "}
            <code className="bg-[var(--muted)] px-1 rounded">export</code> keyword so
            the interface can be imported in other files. <strong>Optional fields</strong>{" "}
            marks every property with{" "}
            <code className="bg-[var(--muted)] px-1 rounded">?</code>, useful when
            your API may omit fields. <strong>Readonly</strong> adds the{" "}
            <code className="bg-[var(--muted)] px-1 rounded">readonly</code> modifier
            to prevent accidental mutation.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <p>
            Typing REST API responses in a frontend app, generating interfaces from
            JSON config files, scaffolding data models from database snapshots,
            converting Postman response examples to TypeScript types, and documenting
            the shape of third-party SDK payloads. All processing runs entirely in
            your browser — no data is sent to a server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JSON to TypeScript Interface Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-schema-validator.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Schema Validator
              </a>
              <a
                href="https://json-diff.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Diff
              </a>
              <a
                href="https://json-path.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Path
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
            name: "JSON to TypeScript Interface Generator",
            description:
              "Generate TypeScript interfaces from JSON data. Handle nested objects, arrays, optional fields, union types. Free online tool.",
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
