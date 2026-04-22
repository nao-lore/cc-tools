import EnvParser from "./components/EnvParser";

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
            .env Parser &amp; Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Parse and validate your <span className="font-mono text-gray-800">.env</span> files,
            detect duplicates and issues, and convert to JSON or YAML instantly.
            Everything runs in your browser — your secrets never leave your machine.
          </p>
        </div>

        {/* Tool */}
        <EnvParser />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a .env File?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A <span className="font-mono">.env</span> file is a plain-text configuration file used
            to store environment variables for applications. Each line contains a
            <span className="font-mono"> KEY=value</span> pair. Frameworks like Node.js, Python,
            Ruby, and Docker all support <span className="font-mono">.env</span> files through
            libraries like dotenv. They keep secrets — API keys, database credentials, feature
            flags — out of your source code.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How This Parser Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Paste your <span className="font-mono">.env</span> content into the textarea. The
            parser reads each line, extracts keys and values, and flags any issues it finds.
            Comments (lines starting with <span className="font-mono">#</span>) are shown but
            excluded from the output. Results appear in three tabs: a validated table view,
            a JSON object, and a YAML mapping — each with a one-click copy button.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Gets Validated
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Duplicate keys</strong> — the same key appearing on multiple lines, which
              causes silent overrides depending on your runtime.
            </li>
            <li>
              <strong>Invalid lines</strong> — lines that contain no <span className="font-mono">=</span> sign
              and are not comments or blank lines.
            </li>
            <li>
              <strong>Empty values</strong> — keys present but with no value assigned, which may
              cause runtime errors if the value is required.
            </li>
            <li>
              <strong>Unquoted special characters</strong> — values containing spaces, hashes, or
              shell-special characters that should be wrapped in quotes.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Audit a team&apos;s shared <span className="font-mono">.env.example</span> for missing
              or malformed entries before onboarding a new developer.
            </li>
            <li>
              Convert environment variables to JSON for injection into CI/CD pipelines or
              infrastructure-as-code tools like Terraform or Pulumi.
            </li>
            <li>
              Generate YAML configuration blocks for Docker Compose or Kubernetes secrets from
              an existing <span className="font-mono">.env</span> file.
            </li>
            <li>
              Quickly spot duplicate variable names that could cause hard-to-debug configuration
              issues across environments.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            .env Parser &amp; Converter — Free online tool. No signup required.
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
                href="https://yaml-to-json-theta.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
              </a>
              <a
                href="https://toml-formatter.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                TOML Formatter
              </a>
              <a
                href="https://csv-viewer-puce.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV Viewer
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

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
