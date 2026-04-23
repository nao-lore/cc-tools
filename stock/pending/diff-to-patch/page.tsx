import DiffToPatch from "./components/DiffToPatch";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Diff to Patch Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste a unified diff and generate a git-apply compatible{" "}
            <code className="bg-gray-100 px-1 rounded text-sm">.patch</code>{" "}
            file with author, date, and commit message headers.
          </p>
        </div>

        {/* Tool */}
        <DiffToPatch />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed text-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            What Is a .patch File?
          </h2>
          <p>
            A <code className="bg-gray-100 px-1 rounded">.patch</code> file is a
            plain-text file containing a unified diff with additional git
            headers. It describes exactly what changes need to be applied to a
            set of files. Patch files are used to share code changes via email,
            apply commits from one repository to another, or archive changes
            without a full git history.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            Unified Diff Format
          </h2>
          <p>
            A unified diff starts with{" "}
            <code className="bg-gray-100 px-1 rounded font-mono text-xs">
              ---
            </code>{" "}
            and{" "}
            <code className="bg-gray-100 px-1 rounded font-mono text-xs">
              +++
            </code>{" "}
            lines identifying the original and modified files, followed by
            hunks marked with{" "}
            <code className="bg-gray-100 px-1 rounded font-mono text-xs">
              @@
            </code>{" "}
            line markers. Lines starting with{" "}
            <code className="bg-gray-100 px-1 rounded font-mono text-xs">-</code>{" "}
            are removed and lines starting with{" "}
            <code className="bg-gray-100 px-1 rounded font-mono text-xs">+</code>{" "}
            are added.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            How to Apply a .patch File
          </h2>
          <p>
            Once you have a{" "}
            <code className="bg-gray-100 px-1 rounded">.patch</code> file, apply
            it with:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs overflow-x-auto">
{`# Apply with git am (preserves author and commit message)
git am changes.patch

# Apply only the file changes (no commit)
git apply changes.patch

# Traditional patch command
patch -p1 < changes.patch`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900">
            How to Use This Tool
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              Paste your unified diff output into the input area. You can
              generate one with{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-xs">
                git diff
              </code>{" "}
              or{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-xs">
                diff -u original.txt modified.txt
              </code>
              .
            </li>
            <li>
              Optionally fill in author name, email, date, and a commit message
              (subject line).
            </li>
            <li>
              The formatted{" "}
              <code className="bg-gray-100 px-1 rounded">.patch</code> output
              appears instantly.
            </li>
            <li>Copy to clipboard or download the file directly.</li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Diff to Patch Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://text-diff.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="https://gitignore-generator-sage.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .gitignore Generator
              </a>
              <a
                href="https://changelog-formatter.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Changelog Formatter
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
            name: "Diff to Patch Converter",
            description:
              "Convert unified diffs to git-apply compatible .patch files. Set author, date, commit message. Download .patch files. Free tool.",
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
