import ChmodCalculator from "./components/ChmodCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Chmod Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate Unix file permissions interactively. Toggle checkboxes,
            enter numeric values, or pick a preset to generate chmod commands
            instantly.
          </p>
        </div>

        {/* Chmod Calculator Tool */}
        <ChmodCalculator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is chmod?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">chmod</code> (change mode) is a Unix and Linux command used to set
            file and directory permissions. It controls who can read, write, or
            execute a file. Permissions are assigned to three categories: the
            file owner, the group, and all other users.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Permission Values
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Each permission type has a numeric value: read (4), write (2), and
            execute (1). These values are summed for each category to produce a
            single digit. Three digits together form the complete permission
            code:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`7 = read (4) + write (2) + execute (1) = rwx
6 = read (4) + write (2)               = rw-
5 = read (4) + execute (1)             = r-x
4 = read (4)                           = r--
0 = no permissions                     = ---`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Permission Examples
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>755</strong> — Owner can read, write, and execute. Group
              and others can read and execute. Common for scripts and
              directories.
            </li>
            <li>
              <strong>644</strong> — Owner can read and write. Group and others
              can only read. Standard for regular files.
            </li>
            <li>
              <strong>700</strong> — Owner has full access. No one else can
              access the file. Used for private scripts.
            </li>
            <li>
              <strong>600</strong> — Owner can read and write. No access for
              anyone else. Common for SSH keys and config files.
            </li>
            <li>
              <strong>444</strong> — Everyone can read, no one can write or
              execute. Read-only for all users.
            </li>
            <li>
              <strong>777</strong> — Full access for everyone. Generally
              discouraged for security reasons.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Numeric vs Symbolic Notation
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Permissions can be expressed in two ways. Numeric (octal) notation
            uses three digits like <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">755</code>. Symbolic notation uses
            letters: <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">r</code> for read, <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">w</code> for write,
            and <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">x</code> for execute. A dash (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">-</code>) indicates
            the permission is not set. For example, <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">rwxr-xr-x</code> is
            the symbolic form of <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">755</code>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Calculator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Toggle checkboxes</strong> in the permission grid to set
              read, write, and execute for each user category.
            </li>
            <li>
              <strong>Enter a numeric value</strong> directly (like 755) and
              the checkboxes will update automatically.
            </li>
            <li>
              <strong>Use a preset</strong> for common permission patterns like
              644, 755, or 777.
            </li>
            <li>
              <strong>Copy the result</strong> — numeric code, symbolic string,
              or the full chmod command — with one click.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Chmod Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/cron-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Cron Generator</a>
              <a href="/epoch-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch Converter</a>
              <a href="/regex-tester" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
              <a href="/http-status" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTTP Status</a>
              <a href="/binary-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Binary Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
