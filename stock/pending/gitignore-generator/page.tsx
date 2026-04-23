import GitignoreGenerator from "./components/GitignoreGenerator";

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
            .gitignore Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate .gitignore files for any project type. Pick from 50+
            templates for languages, frameworks, IDEs, and operating systems.
            Combine multiple templates and download instantly.
          </p>
        </div>

        {/* Generator Tool */}
        <GitignoreGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a .gitignore File?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A .gitignore file tells Git which files and directories to exclude
            from version control. Placing one at the root of your repository
            prevents build artifacts, dependency folders, secret files, and
            editor-specific metadata from being committed. Every project should
            have a .gitignore to keep the repository clean and avoid leaking
            sensitive information.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            .gitignore Syntax Explained
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Each line in a .gitignore file is a pattern. Lines starting with{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">#</code>{" "}
            are comments. A leading slash anchors the pattern to the root. A
            trailing slash matches only directories. The{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">*</code>{" "}
            wildcard matches anything except a slash, while{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">**</code>{" "}
            matches across directories. Prefix a pattern with{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">!</code>{" "}
            to negate it (re-include a previously ignored file).
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`# Ignore all .log files
*.log

# Ignore node_modules directory
node_modules/

# But keep this specific file
!important.log

# Ignore build output at root only
/dist/`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Search or browse</strong> the template categories — Languages,
              Frameworks, IDEs, DevOps, and more.
            </li>
            <li>
              <strong>Click templates to select them.</strong> Selected templates
              are highlighted in indigo. Click again to deselect.
            </li>
            <li>
              <strong>Combine as many as you need.</strong> For a typical web
              project you might combine Node.js + React + VSCode + macOS.
            </li>
            <li>
              <strong>Review the live preview</strong> with syntax highlighting
              in the dark code panel below the template grid.
            </li>
            <li>
              <strong>Copy or download</strong> the generated file and save it as{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.gitignore</code>{" "}
              in the root of your project.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Should You Ignore?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Dependencies:</strong>{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">node_modules/</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">vendor/</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.venv/</code> — these
              can always be restored from a lock file.
            </li>
            <li>
              <strong>Build output:</strong>{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">dist/</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">build/</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">target/</code> — generated
              files should not be versioned.
            </li>
            <li>
              <strong>Secrets:</strong>{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.env</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">*.key</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">credentials.json</code> — never
              commit API keys or passwords.
            </li>
            <li>
              <strong>OS metadata:</strong>{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.DS_Store</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">Thumbs.db</code> — operating
              system noise that clutters diffs.
            </li>
            <li>
              <strong>IDE files:</strong>{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.idea/</code>,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.vscode/</code> — personal
              editor settings are usually not team-shared.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Global vs. Per-Project .gitignore
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Git supports two levels of ignore rules. A per-project{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.gitignore</code> lives in
            the repository and is committed so the whole team benefits. A global
            gitignore (configured with{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">git config --global core.excludesfile</code>)
            applies to every repository on your machine and is the right place
            for OS and editor patterns like{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.DS_Store</code> or{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.vscode/</code>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Already Tracked Files
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Adding a pattern to .gitignore will not untrack files that Git is
            already tracking. To stop tracking a file you previously committed,
            run{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">git rm --cached &lt;file&gt;</code>{" "}
            and then commit. This removes the file from Git&apos;s index without
            deleting it from disk.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            gitignore-generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://robots-txt-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Robots.txt Generator
              </a>
              <a
                href="/meta-tag-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Meta Tag Generator
              </a>
              <a
                href="/json-formatter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="/regex-tester"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Regex Tester
              </a>
              <a
                href="/http-status"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                HTTP Status
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
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
