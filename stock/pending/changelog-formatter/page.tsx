import ChangelogFormatter from "./components/ChangelogFormatter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Changelog Formatter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste git commit messages and get a structured Markdown changelog
            grouped by type. Supports Conventional Commits — feat, fix, chore,
            and more.
          </p>
        </div>

        {/* Tool */}
        <ChangelogFormatter />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed text-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            What Is a Changelog?
          </h2>
          <p>
            A changelog is a curated, chronologically ordered list of notable
            changes for each version of a project. It tells users and
            contributors what changed, when, and why. A well-maintained
            CHANGELOG.md is one of the first things open-source contributors
            look for before submitting a pull request.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            Conventional Commits Format
          </h2>
          <p>
            This tool parses the{" "}
            <a
              href="https://www.conventionalcommits.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Conventional Commits
            </a>{" "}
            specification, which structures commit messages as:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs overflow-x-auto">
{`<type>[optional scope][optional !]: <description>

Examples:
feat(auth): add OAuth2 login
fix(api): handle null response from upstream
chore!: drop Node 14 support
docs: update README installation steps`}
          </pre>
          <p>
            The <code className="bg-gray-100 px-1 rounded">!</code> suffix or a{" "}
            <code className="bg-gray-100 px-1 rounded">BREAKING CHANGE</code>{" "}
            keyword marks a breaking change. This tool highlights those commits
            and optionally groups them in a dedicated section at the top.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            Supported Commit Types
          </h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>feat</strong> — A new feature
            </li>
            <li>
              <strong>fix</strong> — A bug fix
            </li>
            <li>
              <strong>chore</strong> — Maintenance tasks (no production code change)
            </li>
            <li>
              <strong>docs</strong> — Documentation only changes
            </li>
            <li>
              <strong>refactor</strong> — Code restructuring without behavior change
            </li>
            <li>
              <strong>perf</strong> — Performance improvements
            </li>
            <li>
              <strong>test</strong> — Adding or fixing tests
            </li>
            <li>
              <strong>style</strong> — Formatting, whitespace, semicolons
            </li>
            <li>
              <strong>ci</strong> — CI configuration changes
            </li>
            <li>
              <strong>build</strong> — Build system or dependency changes
            </li>
            <li>
              <strong>other</strong> — Any commit not matching the above
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900">
            How to Use This Tool
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              Run{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-xs">
                git log --oneline v1.1.0..HEAD
              </code>{" "}
              in your terminal to get commits since the last release.
            </li>
            <li>Paste the output into the left textarea.</li>
            <li>Enter a version number and release date (optional).</li>
            <li>
              Toggle the <strong>Breaking changes section</strong> if you want a
              dedicated block at the top.
            </li>
            <li>Copy the Markdown output and paste it into CHANGELOG.md.</li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Changelog Formatter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://gitignore-generator-sage.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .gitignore Generator
              </a>
              <a
                href="https://text-diff.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="https://readme-generator-lake.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                README Generator
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
            name: "Changelog Formatter",
            description:
              "Convert git commits to structured changelog. Groups by type (feat/fix/chore). Markdown output. Free changelog generator.",
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
