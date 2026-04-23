import PrimeChecker from "./components/PrimeChecker";

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
            Prime Number Checker &amp; Factorizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check if any number is prime, find its prime factorization, or
            generate all primes up to 10,000,000 using the Sieve of Eratosthenes.
          </p>
        </div>

        {/* Tool */}
        <PrimeChecker />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Prime Number?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A <strong>prime number</strong> is a natural number greater than 1
            that has no positive divisors other than 1 and itself. The first few
            primes are 2, 3, 5, 7, 11, 13, 17, 19, 23, and 29. The number 2 is
            the only even prime; all other even numbers are divisible by 2 and
            therefore composite.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Prime Factorization
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Every composite number can be written as a unique product of prime
            numbers — a result known as the{" "}
            <strong>Fundamental Theorem of Arithmetic</strong>. For example,
            60&nbsp;=&nbsp;2²&nbsp;×&nbsp;3&nbsp;×&nbsp;5. Finding this
            factorization is useful in simplifying fractions, computing the
            greatest common divisor (GCD), and understanding number theory
            concepts.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sieve of Eratosthenes
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <strong>Sieve of Eratosthenes</strong> is an ancient algorithm
            for finding all primes up to a given limit. It works by iteratively
            marking the multiples of each prime starting from 2, leaving only
            the primes unmarked. The algorithm runs in{" "}
            <em>O(n&nbsp;log&nbsp;log&nbsp;n)</em> time and is one of the most
            efficient ways to generate a list of primes for numbers up to about
            10 million.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Check Number:</strong> Enter any integer to instantly see
              whether it is prime or composite. For composite numbers, the full
              prime factorization is shown as a tree (e.g.&nbsp;60&nbsp;=&nbsp;2²&nbsp;×&nbsp;3&nbsp;×&nbsp;5).
            </li>
            <li>
              <strong>Generate Primes:</strong> Enter a limit (up to 10,000,000)
              to generate every prime up to that value using the Sieve of
              Eratosthenes. The total count and largest prime are displayed.
            </li>
            <li>
              Click <strong>Copy Result</strong> or <strong>Copy All Primes</strong>{" "}
              to copy the output to your clipboard.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Prime Number Checker &amp; Factorizer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://statistics-calculator-five.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Statistics Calculator</a>
              <a href="https://bitwise-calculator-tau.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Bitwise Calculator</a>
              <a href="https://number-base-converter-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Number Base Converter</a>
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
    </div>
  );
}
