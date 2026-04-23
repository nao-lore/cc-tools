import EnvDiff from "./components/EnvDiff";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            .env File Diff
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare two .env files side by side. Find missing variables and
            different values. Sync .env.example with production instantly.
          </p>
        </div>

        <EnvDiff />

        <section className="mt-16 mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is .env File Diff?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            .env File Diff parses two environment variable files and shows
            exactly what differs — which keys are missing, which have different
            values, and which match. It is useful for syncing{" "}
            <code className="bg-gray-100 px-1 rounded text-sm">.env.example</code>{" "}
            with production, comparing staging vs. production configs, or
            onboarding teammates who need the right variables.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Color Coding
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong className="text-green-700">Green</strong> — Key exists in
              both files with the same value.
            </li>
            <li>
              <strong className="text-yellow-700">Yellow</strong> — Key exists
              in both files but values differ.
            </li>
            <li>
              <strong className="text-red-700">Red / only-in-A or only-in-B</strong>{" "}
              — Key is missing from one of the files.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              Paste your first .env file (e.g.{" "}
              <code className="bg-gray-100 px-1 rounded text-sm">.env.example</code>
              ) into the .env A panel.
            </li>
            <li>
              Paste your second .env file (e.g. production) into the .env B
              panel.
            </li>
            <li>
              Click <strong>Compare</strong> to see the results as a color-coded
              table.
            </li>
            <li>
              Use <strong>Copy missing from A</strong> or{" "}
              <strong>Copy missing from B</strong> to grab the keys you need to
              add.
            </li>
          </ol>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            .env File Diff — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-diff-six.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Diff
              </a>
              <a
                href="https://env-parser-tau.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .env Parser
              </a>
              <a
                href="https://gitignore-generator-chi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .gitignore Generator
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: ".env File Diff",
            description:
              "Compare two .env files side by side. Find missing variables and different values.",
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
    </div>
  );
}
