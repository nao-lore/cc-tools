import JsonToZod from "./components/JsonToZod";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">JSON to Zod Schema Generator</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Paste any JSON sample and instantly generate a Zod validation schema.
          Handles nested objects, arrays, null values, optional fields, and
          mixed-type arrays. All processing runs entirely in your browser.
        </p>

        <JsonToZod />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is Zod?
          </h2>
          <p>
            Zod is a TypeScript-first schema declaration and validation library.
            You define a schema once and Zod infers the static TypeScript type
            automatically. It is widely used to validate API responses, form
            inputs, environment variables, and any runtime data in React, Next.js,
            and Node.js projects.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            How the Generator Works
          </h2>
          <p>
            The tool parses your JSON sample and infers a Zod type for each
            value. Primitives map to{" "}
            <code className="bg-[var(--muted)] px-1 rounded">z.string()</code>,{" "}
            <code className="bg-[var(--muted)] px-1 rounded">z.number()</code>, or{" "}
            <code className="bg-[var(--muted)] px-1 rounded">z.boolean()</code>.
            Nested objects become named sub-schemas. Arrays use{" "}
            <code className="bg-[var(--muted)] px-1 rounded">z.array()</code> with
            the element type inferred from the first element. Mixed-type arrays
            become{" "}
            <code className="bg-[var(--muted)] px-1 rounded">z.union()</code>.
            Null values produce{" "}
            <code className="bg-[var(--muted)] px-1 rounded">z.nullable()</code>.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Options Explained
          </h2>
          <p>
            <strong>Schema name</strong> controls the name of the exported
            top-level constant.{" "}
            <strong>Strict mode</strong> wraps{" "}
            <code className="bg-[var(--muted)] px-1 rounded">z.object()</code>{" "}
            with{" "}
            <code className="bg-[var(--muted)] px-1 rounded">.strict()</code>,
            rejecting any keys not defined in the schema.{" "}
            <strong>Optional fields</strong> appends{" "}
            <code className="bg-[var(--muted)] px-1 rounded">.optional()</code>
            to every field, useful when API responses may omit fields.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <p>
            Validating REST API responses at runtime, parsing environment
            variables with type safety, validating form payloads in Next.js
            Server Actions, generating schemas from Postman response examples,
            and typing third-party webhook payloads. All processing runs entirely
            in your browser — no data is sent to a server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JSON to Zod Schema Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-to-typescript.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON to TypeScript
              </a>
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
            name: "JSON to Zod Schema Generator",
            description:
              "Generate Zod validation schemas from JSON data. Handle objects, arrays, optionals, unions. Free online Zod generator.",
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
