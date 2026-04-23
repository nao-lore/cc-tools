import PasswordStrength from "./components/PasswordStrength";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Password Strength Checker
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Instantly check how strong your password is. Get a security score,
          estimated crack time, and actionable suggestions — all in your browser.
        </p>
      </div>

      {/* Tool */}
      <div className="px-4 pb-8">
        <PasswordStrength />
      </div>

      {/* AdSense placeholder */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div
          className="rounded-lg border border-dashed p-8 text-center text-sm opacity-30"
          style={{ borderColor: "var(--border)" }}
        >
          Ad space
        </div>
      </div>

      {/* SEO content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <article
          className="rounded-xl p-6 sm:p-8 border space-y-6 text-sm leading-relaxed opacity-80"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <section>
            <h2 className="text-lg font-bold mb-2">What makes a password strong?</h2>
            <p>
              A strong password combines length, variety, and unpredictability. The longer a
              password, the exponentially harder it is to crack by brute force. Adding uppercase
              letters, lowercase letters, numbers, and symbols dramatically increases the search
              space an attacker must explore. A 16-character password using all character types
              would take modern hardware billions of years to crack.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">How crack time is estimated</h2>
            <p>
              Crack time estimates assume an offline brute-force attack at around 10 billion
              guesses per second — the approximate speed of consumer GPU cracking hardware. Real-world
              attack speed depends on the hashing algorithm used to store the password. Common
              patterns, dictionary words, and sequential characters reduce effective strength because
              attackers use wordlists and rule-based attacks before trying every combination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Best practices</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Use a unique password for every account</li>
              <li>Aim for 16+ characters when possible</li>
              <li>Use a password manager to generate and store passwords</li>
              <li>Enable two-factor authentication (2FA) wherever available</li>
              <li>Avoid personal information like names, birthdays, or pet names</li>
              <li>Never reuse passwords across different sites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Privacy guarantee</h2>
            <p>
              This tool runs entirely in your browser using JavaScript. Your password is never
              transmitted to any server — not even for analysis. You can verify this by
              disconnecting from the internet and using the tool; it will continue to work normally.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Password Strength Checker — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://password-generator-one.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Password Generator</a>
              <a href="/hash-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
              <a href="/uuid-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">UUID Generator</a>
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
