import RegexTester from "./components/RegexTester";

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
            Regex Tester
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test and debug regular expressions in real time. See matches
            highlighted instantly, inspect capture groups, and test replacements.
          </p>
        </div>

        {/* Regex Tester Tool */}
        <RegexTester />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Regular Expression?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A regular expression (regex) is a sequence of characters that defines
            a search pattern. Regular expressions are used in programming,
            text editors, and command-line tools to find, match, and manipulate
            text. They are supported in virtually every programming language
            including JavaScript, Python, Java, Go, Ruby, and PHP.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Regex Tester
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Enter your regular expression pattern in the pattern field at the top.
            Toggle flags like global (g), case-insensitive (i), multiline (m),
            dotAll (s), and unicode (u) using the checkboxes. Type or paste your
            test string in the textarea below. Matches are highlighted in real
            time as you type. The results panel shows each match with its index
            position and any captured groups. Use the replace field to test
            substitutions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Regex Patterns
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Some frequently used patterns include email validation
            (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{"{2,}"}</code>),
            URL matching, phone number extraction, IP address validation, and
            date format detection. This tool includes a quick-select menu with
            these common patterns so you can start testing immediately without
            writing the regex from scratch.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Regex Flags Explained
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>g (global)</strong> — Find all matches, not just the first
              one.
            </li>
            <li>
              <strong>i (case-insensitive)</strong> — Match letters regardless of
              case.
            </li>
            <li>
              <strong>m (multiline)</strong> — Make ^ and $ match the start and
              end of each line.
            </li>
            <li>
              <strong>s (dotAll)</strong> — Make the dot (.) match newline
              characters as well.
            </li>
            <li>
              <strong>u (unicode)</strong> — Enable full Unicode matching.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Regex Tester — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/cron-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Cron Generator</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="/sql-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SQL Formatter</a>
              <a href="/uuid-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">UUID Generator</a>
              <a href="/chmod-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Chmod Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Regex Tester",
  "description": "Test and debug regular expressions in real time. See matches\n            highlighted instantly, inspect capture groups, and test replacements.",
  "url": "https://tools.loresync.dev/regex-tester",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
