import PackageJsonChecker from "./components/PackageJsonChecker";

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
            package.json Linter &amp; Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Validate your <span className="font-mono text-gray-800">package.json</span> for missing
            fields, version conflicts, and common mistakes. Analyze all dependencies at a glance.
            Everything runs in your browser — nothing is sent to a server.
          </p>
        </div>

        {/* Tool */}
        <PackageJsonChecker />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What This Linter Checks
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Paste your <span className="font-mono">package.json</span> and the linter instantly
            flags errors, warnings, and informational notes across several categories: required
            metadata fields, semantic version format, dependency version prefix consistency,
            missing module entry points, and duplicate package names across dependency groups.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common package.json Issues
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Missing name or version</strong> — required by npm for publishing. Tools like
              bundlers and package managers rely on these fields being present.
            </li>
            <li>
              <strong>Invalid semver format</strong> — a version like <span className="font-mono">1.0</span> or{" "}
              <span className="font-mono">v1.0.0</span> is not valid semver and may cause publish
              failures.
            </li>
            <li>
              <strong>Mixed ^ and ~ prefixes</strong> — mixing caret and tilde ranges in the same
              project makes lock file diffs unpredictable and signals inconsistent update policies.
            </li>
            <li>
              <strong>Duplicate dependencies</strong> — a package listed in both{" "}
              <span className="font-mono">dependencies</span> and{" "}
              <span className="font-mono">devDependencies</span> can cause version conflicts and
              bloated production bundles.
            </li>
            <li>
              <strong>Missing main / module / types</strong> — library packages without these
              fields may not be importable by consumers or TypeScript users.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Open your project&apos;s <span className="font-mono">package.json</span>, copy the
            entire file, and paste it into the textarea above. Results appear instantly. The issues
            panel lists each problem with its severity: errors block publishing or building, warnings
            indicate best-practice violations, and info items are suggestions worth considering.
            The dependencies table shows every package alongside its version constraint and group
            so you can audit them at a glance.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            package.json Linter &amp; Analyzer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-schema-validator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Schema Validator
              </a>
              <a
                href="https://env-parser.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .env Parser
              </a>
              <a
                href="https://json-diff-viewer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Diff
              </a>
              <a
                href="https://gitignore-generator.vercel.app"
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
