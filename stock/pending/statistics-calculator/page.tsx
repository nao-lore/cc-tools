import StatisticsCalculator from "./components/StatisticsCalculator";

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
            Descriptive Statistics Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your data set and instantly compute mean, median, mode, standard
            deviation, variance, quartiles, IQR, and more.
          </p>
        </div>

        {/* Tool */}
        <StatisticsCalculator />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is Descriptive Statistics?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Descriptive statistics summarize and describe the main features of a
            data set without making inferences about a larger population. Measures
            of central tendency (mean, median, mode) tell you where the data
            clusters, while measures of dispersion (range, variance, standard
            deviation) tell you how spread out the values are.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mean, Median, and Mode
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <strong>mean</strong> (arithmetic average) is the sum of all
            values divided by the count. It is sensitive to outliers. The{" "}
            <strong>median</strong> is the middle value when the data is sorted; it
            is robust to extreme values and better represents a typical observation
            in skewed distributions. The <strong>mode</strong> is the value (or
            values) that appear most frequently — a data set can be unimodal,
            bimodal, or multimodal.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Variance and Standard Deviation
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Variance</strong> measures the average squared deviation from
            the mean. The <strong>population variance</strong> divides by{" "}
            <em>n</em> (all observations are the entire population), while the{" "}
            <strong>sample variance</strong> divides by <em>n&nbsp;-&nbsp;1</em>{" "}
            (Bessel&apos;s correction) to produce an unbiased estimate when your
            data is a sample from a larger population.{" "}
            <strong>Standard deviation</strong> is simply the square root of the
            variance, returning the spread to the same unit as the original data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quartiles and IQR
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Quartiles divide a sorted data set into four equal parts. Q1 (the
            first quartile) is the median of the lower half, and Q3 (the third
            quartile) is the median of the upper half. The{" "}
            <strong>interquartile range (IQR)</strong> is Q3&nbsp;-&nbsp;Q1 and
            represents the middle 50% of the data. The IQR is commonly used to
            detect outliers: values more than 1.5&nbsp;&times;&nbsp;IQR below Q1
            or above Q3 are considered potential outliers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Calculator
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Enter numbers separated by commas, spaces, or newlines in the input
              box.
            </li>
            <li>
              Results update automatically as you type — no need to click a button.
            </li>
            <li>
              Use the histogram to visualize the distribution shape of your data.
            </li>
            <li>
              Click <strong>Copy All Stats</strong> to copy a summary to your
              clipboard.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Descriptive Statistics Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://bitwise-calculator-tau.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Bitwise Calculator</a>
              <a href="https://ip-calculator-theta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">IP Subnet Calculator</a>
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
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
