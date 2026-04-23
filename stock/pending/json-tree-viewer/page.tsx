import JsonTreeViewer from "./components/JsonTreeViewer";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">JSON Tree Viewer</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Visualize JSON as an interactive collapsible tree. Click nodes to copy
          their path or value. Search to filter and highlight matching keys or
          values.
        </p>

        <JsonTreeViewer />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is a JSON Tree Viewer?
          </h2>
          <p>
            A JSON Tree Viewer renders raw JSON text as a hierarchical,
            expandable tree structure — making it easy to navigate deeply nested
            objects and arrays without manually counting braces or brackets. Each
            node in the tree represents a key-value pair, array element, or
            primitive value. You can collapse branches you don&apos;t need and
            expand only the parts that matter, which is especially helpful with
            large API responses or configuration files.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Color-Coded Value Types
          </h2>
          <p>
            Each JSON value type is rendered in a distinct color for instant
            recognition. Strings appear in green, numbers in orange, booleans in
            blue, null in gray, and object keys in purple. This mirrors the
            syntax highlighting convention used by most code editors and makes
            scanning a complex JSON structure much faster than reading plain text.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Copy JSON Paths and Values
          </h2>
          <p>
            Hover over any node to reveal two copy buttons: <strong>path</strong>{" "}
            and <strong>copy</strong>. The path button copies the JSONPath
            expression for that node (e.g.,{" "}
            <code className="bg-[var(--muted)] px-1 rounded">
              $.store.books[0].title
            </code>
            ), which you can use directly in JSONPath query tools or programming
            language libraries. The copy button copies the raw value — or the
            full JSON subtree if the node is an object or array.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Search and Filter
          </h2>
          <p>
            Type into the search box to instantly highlight any node whose key or
            value matches your query. Parent nodes are automatically expanded so
            matching descendants are always visible. This makes it easy to locate
            a specific field inside a deeply nested response without manually
            expanding every branch.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Expand All and Collapse All
          </h2>
          <p>
            Use the Expand All button to open every node in the tree at once —
            useful when you want a complete overview of the JSON structure.
            Collapse All closes every node back to the root level so you can
            navigate the top-level keys and drill in selectively. Both actions
            apply instantly without any page reload.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              Inspecting API responses during development or debugging without a
              full IDE.
            </li>
            <li>
              Navigating large configuration files such as{" "}
              <code className="bg-[var(--muted)] px-1 rounded">
                package.json
              </code>
              ,{" "}
              <code className="bg-[var(--muted)] px-1 rounded">
                tsconfig.json
              </code>
              , or OpenAPI specs.
            </li>
            <li>
              Extracting the exact JSONPath expression needed for a query or
              transformation.
            </li>
            <li>
              Validating JSON structure before sending it to an API or storing it
              in a database.
            </li>
          </ul>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JSON Tree Viewer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="/json-formatter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://json-to-csv-two.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON to CSV
              </a>
              <a
                href="/yaml-to-json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
              </a>
              <a
                href="https://json-schema-validator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Schema Validator
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
            name: "JSON Tree Viewer",
            description:
              "Visualize JSON as an interactive collapsible tree. Search, filter, copy paths or values. Handle large JSON files.",
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
