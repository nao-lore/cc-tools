import GcdLcmCalculator from "./components/GcdLcmCalculator";

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
            GCD &amp; LCM Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate the Greatest Common Divisor and Least Common Multiple of
            2 to 10 numbers. See step-by-step Euclidean algorithm and prime
            factorization.
          </p>
        </div>

        {/* Tool */}
        <GcdLcmCalculator />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is the Greatest Common Divisor (GCD)?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Greatest Common Divisor (GCD), also called the Greatest Common
            Factor (GCF) or Highest Common Factor (HCF), is the largest positive
            integer that divides each of the given numbers without a remainder.
            For example, the GCD of 12 and 18 is 6 because 6 is the largest
            number that divides both evenly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is the Least Common Multiple (LCM)?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Least Common Multiple (LCM) is the smallest positive integer
            that is divisible by each of the given numbers. For example, the LCM
            of 4 and 6 is 12 because 12 is the smallest number that both 4 and 6
            divide into evenly. LCM is widely used when adding fractions with
            different denominators.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            The Euclidean Algorithm
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Euclidean algorithm is one of the oldest known algorithms,
            described by Euclid around 300 BCE. It computes the GCD of two
            numbers by repeatedly replacing the larger number with the remainder
            of dividing the larger by the smaller, until the remainder is zero.
            The last non-zero remainder is the GCD. For multiple numbers, the
            algorithm is applied pairwise:{" "}
            <code>gcd(a, b, c) = gcd(gcd(a, b), c)</code>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Prime Factorization Method
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            An alternative approach expresses each number as a product of prime
            factors. The <strong>GCD</strong> is the product of all prime factors
            common to every number, each taken to the lowest power it appears.
            The <strong>LCM</strong> is the product of all prime factors that
            appear in any number, each taken to the highest power it appears.
            This method makes the relationship between GCD and LCM especially
            clear.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            GCD &times; LCM = Product of Two Numbers
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For any two positive integers <em>a</em> and <em>b</em>, the product
            of their GCD and LCM equals the product of the numbers themselves:{" "}
            <code>gcd(a, b) &times; lcm(a, b) = a &times; b</code>. This useful
            identity lets you calculate the LCM from the GCD without separate
            factorization:{" "}
            <code>lcm(a, b) = (a &times; b) / gcd(a, b)</code>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Applications
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Simplifying fractions</strong> — divide numerator and
              denominator by their GCD to get the lowest terms.
            </li>
            <li>
              <strong>Adding and subtracting fractions</strong> — find the LCM
              of the denominators to get the least common denominator.
            </li>
            <li>
              <strong>Scheduling problems</strong> — find when repeating events
              with different periods will next coincide using LCM.
            </li>
            <li>
              <strong>Cryptography</strong> — GCD is central to the RSA
              algorithm and modular arithmetic used in public-key cryptography.
            </li>
            <li>
              <strong>Tiling and geometry</strong> — determine the largest
              square tile that fits a rectangle with no cuts using GCD of the
              dimensions.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            GCD &amp; LCM Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://prime-factorization.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Prime Factorization</a>
              <a href="https://fraction-calculator-phi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Fraction Calculator</a>
              <a href="https://unit-converter-tau.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
              <a href="https://percentage-calculator-puce.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Percentage Calculator</a>
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
