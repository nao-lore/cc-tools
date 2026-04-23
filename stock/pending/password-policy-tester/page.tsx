import PasswordPolicyTester from "./components/PasswordPolicyTester";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">password-policy-tester</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Password Policy Tester
          </h1>
          <p className="text-muted text-lg">
            Configure your password policy rules, then test any password to see a per-rule
            pass/fail checklist and a compliance score.
          </p>
        </div>

        <PasswordPolicyTester />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Why Password Policies Matter
          </h2>
          <p>
            Password policies define the minimum security requirements for user credentials.
            They typically enforce a minimum length, require a mix of character types, and
            ban commonly used patterns. A well-crafted policy reduces the chance of weak or
            guessable passwords without making passwords so complex that users resort to
            writing them down.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Choosing a Minimum Length</h3>
          <p>
            Modern security guidelines (NIST SP 800-63B) recommend a minimum of 8 characters
            for standard accounts, with no mandatory complexity rules if length is sufficiently
            high. Longer passphrases — 16 characters or more — are often easier to remember
            and harder to brute-force than short complex passwords.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Character Requirements</h3>
          <p>
            Requiring uppercase, lowercase, numbers, and symbols increases the character space,
            making brute-force attacks slower. However, overly strict requirements can push users
            toward predictable substitutions like <code className="text-accent font-mono text-sm">P@ssw0rd</code>.
            Balance requirements with usability and consider banning known common passwords instead.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Repeated Characters and Common Words</h3>
          <p>
            Repeated characters (e.g., <code className="text-accent font-mono text-sm">aaa</code>)
            and common dictionary words are easy targets for dictionary attacks. Banning them forces
            users to create more unique passwords. This tool checks for runs of 3 or more identical
            consecutive characters and a curated list of the most commonly used passwords and words.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Password Policy Tester — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://password-strength-five.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Password Strength</a>
              <a href="https://jwt-generator-two.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JWT Generator</a>
              <a href="https://csp-builder-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSP Builder</a>
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
