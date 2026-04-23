import ReadmeGenerator from "./components/ReadmeGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            README.md Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill in the form, toggle sections on or off, pick a template, and get a
            professional README.md instantly.
          </p>
        </div>

        {/* Generator Tool */}
        <ReadmeGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Makes a Good README?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A README is the front page of your project. It tells potential users and
            contributors what the project does, why it exists, and how to get started.
            A well-structured README increases adoption, reduces support questions, and
            signals that the project is actively maintained.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Essential README Sections
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Project title and description</strong> — A one-sentence summary
              of what the project does and why it matters.
            </li>
            <li>
              <strong>Badges</strong> — Status indicators like build passing, npm
              version, and license help users evaluate the project at a glance.
            </li>
            <li>
              <strong>Features list</strong> — Bullet points highlighting the key
              capabilities of your project.
            </li>
            <li>
              <strong>Installation</strong> — Exact commands needed to install and set
              up the project. Always include the package manager commands.
            </li>
            <li>
              <strong>Usage examples</strong> — Real code snippets showing how to use
              the project in practice.
            </li>
            <li>
              <strong>Contributing guide</strong> — Instructions for how others can
              contribute, including branching strategy and PR process.
            </li>
            <li>
              <strong>License</strong> — Clearly state what license the project is
              under so users know their rights.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Choose a template</strong> — Minimal for simple projects,
              Standard for typical open source, Detailed for full documentation.
            </li>
            <li>
              <strong>Fill in your project info</strong> — Name, description, and
              GitHub repo details for badge URLs.
            </li>
            <li>
              <strong>Toggle sections</strong> — Turn individual sections on or off
              with the toggle switches.
            </li>
            <li>
              <strong>Add features and tech stack</strong> — Use the list editors to
              add and remove items one by one.
            </li>
            <li>
              <strong>Preview in real time</strong> — The markdown preview updates
              instantly as you type.
            </li>
            <li>
              <strong>Copy the markdown</strong> — Click the Copy Markdown button and
              paste directly into your repository.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            README Badge Tips
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Badges from Shields.io and similar services provide at-a-glance
            information about your project&apos;s health. The npm version badge shows
            users the latest published version. The build status badge (typically
            linked to GitHub Actions) shows whether tests are passing. The license
            badge communicates usage rights immediately. For public npm packages, add
            your exact package name in the npm Package Name field to generate correct
            badge URLs.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            README Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://gitignore-generator-jade.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .gitignore Generator
              </a>
              <a
                href="https://license-generator-rouge.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                License Generator
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
                href="https://meta-tag-generator-rho.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Meta Tag Generator
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
    </div>
  );
}
