import GraphqlBuilder from "./components/GraphqlBuilder";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            GraphQL Query Builder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your GraphQL schema, select the fields you need, add arguments,
            and instantly get a formatted query or mutation. No signup required.
          </p>
        </div>

        {/* Tool */}
        <GraphqlBuilder />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is GraphQL?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            GraphQL is a query language for APIs that lets clients request exactly
            the data they need. Unlike REST, which exposes fixed endpoints,
            GraphQL exposes a single endpoint and lets you describe your data
            requirements using a typed schema. This makes it possible to fetch
            nested objects, filter by arguments, and avoid over-fetching in a
            single round trip.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Builder
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your SDL schema</strong> into the left panel. The
              builder accepts standard GraphQL Schema Definition Language including
              types, enums, and interfaces.
            </li>
            <li>
              <strong>Pick a root type</strong> — Query or Mutation — then expand
              the field tree in the middle panel and check the fields you want to
              include.
            </li>
            <li>
              <strong>Add arguments</strong> to any field by clicking the
              argument icon next to it and entering key-value pairs.
            </li>
            <li>
              <strong>Copy the result</strong> from the right panel. The output
              is formatted GraphQL with proper indentation and syntax coloring.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            SDL Schema Parsing
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The parser reads standard GraphQL SDL and extracts all object types
            and their fields. Scalar fields (String, Int, Float, Boolean, ID) are
            leaf nodes. Object-type fields expand into nested selections. The
            builder automatically resolves list types (<code>[User]</code>) and
            non-null wrappers (<code>User!</code>) to show the correct nested
            structure.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            GraphQL Query Builder — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-formatter-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="/jwt-decoder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JWT Decoder
              </a>
              <a
                href="https://curl-converter.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                cURL Converter
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

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
