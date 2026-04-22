import SqlFormatter from "./components/SqlFormatter";

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
            SQL Formatter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Format, beautify, and syntax-highlight your SQL queries online.
            Paste your SQL, pick your options, and copy the clean result.
          </p>
        </div>

        {/* SQL Formatter Tool */}
        <SqlFormatter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is SQL Formatting?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            SQL formatting is the process of restructuring a SQL query to improve
            readability. A well-formatted query uses consistent indentation,
            keyword casing, and line breaks to make the logic clear at a glance.
            This is especially important when working with complex queries
            involving multiple joins, subqueries, or conditional expressions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This SQL Formatter
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your SQL</strong> into the input area on the left. It
              can be a single query or multiple statements separated by
              semicolons.
            </li>
            <li>
              <strong>Choose keyword casing</strong> — UPPERCASE makes keywords
              stand out from identifiers; lowercase blends them in for a softer
              style.
            </li>
            <li>
              <strong>Set indentation</strong> to 2 or 4 spaces depending on your
              team's style guide.
            </li>
            <li>
              <strong>Copy the result</strong> with one click and paste it into
              your editor, documentation, or code review.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Features
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Syntax highlighting</strong> — keywords in blue, strings in
              green, numbers in orange, and comments in gray.
            </li>
            <li>
              <strong>Smart formatting</strong> — newlines before major clauses
              (SELECT, FROM, WHERE, JOIN), indented column lists, aligned ON
              conditions.
            </li>
            <li>
              <strong>Minify</strong> — compress your SQL to a single line for
              embedding in code or logs.
            </li>
            <li>
              <strong>No dependencies</strong> — runs entirely in your browser.
              Your SQL never leaves your machine.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported SQL Dialects
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This formatter handles standard SQL syntax used across most database
            systems including PostgreSQL, MySQL, SQLite, SQL Server, and Oracle.
            It supports common clauses like SELECT, INSERT, UPDATE, DELETE, CREATE
            TABLE, as well as window functions (OVER, PARTITION BY), CTEs (WITH),
            and CASE expressions. The formatting is dialect-agnostic — it focuses
            on structure rather than vendor-specific extensions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Clean SQL
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Use table aliases (e.g., <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">users u</code>) to keep
              column references short.
            </li>
            <li>
              Put each selected column on its own line for easier diffs in
              version control.
            </li>
            <li>
              Use CTEs (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">WITH</code>) instead of deeply nested
              subqueries for better readability.
            </li>
            <li>
              Add comments to explain complex business logic within your queries.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">sql-formatter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://json-formatter-topaz-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="https://xml-formatter-xi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">XML Formatter</a>
              <a href="https://yaml-to-json-theta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">YAML to JSON</a>
              <a href="https://regex-tester-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
              <a href="https://minify-js.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Minify JS</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools &rarr;</a>
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
