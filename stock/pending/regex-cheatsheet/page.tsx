import RegexCheatsheet from "./components/RegexCheatsheet";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Regex Cheatsheet & Live Tester
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse regex tokens by category, click to insert into your pattern,
            and see live match highlighting instantly.
          </p>
        </div>

        {/* Main Tool */}
        <RegexCheatsheet />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use the Regex Tester
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Click any token in the left sidebar to append it to your pattern. Toggle flags
            (g, i, m, s) with the flag buttons. Type or paste your test string and watch
            matches highlight in real time. The matches table shows each match with its
            index and any captured groups.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Regex Patterns
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Frequently used patterns you can build with this tool:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li><strong>Email</strong> — <code>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{"{2,}"}</code></li>
            <li><strong>URL</strong> — <code>https?://[\w.-]+(?:/[\w./?=%&-]*)?</code></li>
            <li><strong>IP Address</strong> — <code>(?:\d{"{1,3}"}\.){"{3}"}\d{"{1,3}"}</code></li>
            <li><strong>Date (YYYY-MM-DD)</strong> — <code>\d{"{4}"}-\d{"{2}"}-\d{"{2}"}</code></li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Flags
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <strong>g</strong> (global) flag finds all matches instead of stopping after the first.
            The <strong>i</strong> (case-insensitive) flag makes the pattern ignore letter case.
            The <strong>m</strong> (multiline) flag makes <code>^</code> and <code>$</code> match the
            start and end of each line. The <strong>s</strong> (dotall) flag allows <code>.</code> to
            match newline characters.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Capturing Groups
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Use <code>(abc)</code> to create a capturing group — the matched text is stored and
            shown in the groups column of the results table. Use <code>(?:abc)</code> for a
            non-capturing group when you only need grouping for quantifiers or alternation.
            Named groups <code>(?&lt;name&gt;abc)</code> appear by name in the groups column.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Regex Cheatsheet & Live Tester — Free interactive regex reference
          </p>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              50+ Free Developer Tools →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
