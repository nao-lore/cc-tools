import ReadabilityScore from "./components/ReadabilityScore";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Readability Score Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Instantly calculate Flesch Reading Ease, Flesch-Kincaid Grade Level,
            and Gunning Fog Index for any text. No signup required.
          </p>
        </div>

        {/* Tool */}
        <ReadabilityScore />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Readability Score?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Readability scores are mathematical formulas that estimate how easy
            or difficult a piece of text is to read. They analyze factors like
            sentence length, word length, and syllable count to produce a
            numeric score that corresponds to an approximate US school grade
            level or reading difficulty category.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Flesch Reading Ease
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Developed by Rudolf Flesch in 1948, the Flesch Reading Ease formula
            produces a score between 0 and 100. Higher scores mean easier
            reading. A score of 60–70 is considered plain English, suitable for
            most audiences. Scores below 30 are extremely difficult — typical of
            academic journals and legal documents. Most consumer-facing content
            targets a score of 60 or above.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Flesch-Kincaid Grade Level
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Flesch-Kincaid Grade Level formula translates the same
            underlying metrics into a US school grade number. A score of 8 means
            an eighth grader should be able to understand the text. The US
            Department of Defense uses this formula as the standard readability
            test for its publications. The formula was developed in 1975 by J.
            Peter Kincaid and a team for the US Navy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Gunning Fog Index
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Gunning Fog Index, created by Robert Gunning in 1952, emphasizes
            the proportion of complex words — words with three or more syllables.
            It estimates the years of formal education a reader needs to
            understand the text on the first reading. A score of 12 corresponds
            to a high school senior. Most business writing aims for a Fog Index
            below 12.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Improving Readability
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Shorten sentences — aim for an average of 15–20 words per
              sentence.
            </li>
            <li>
              Prefer common, everyday words over technical jargon where
              possible.
            </li>
            <li>
              Break long paragraphs into shorter ones with clear topic sentences.
            </li>
            <li>
              Use active voice instead of passive constructions to reduce word
              count.
            </li>
            <li>
              Avoid nominalizations — use verbs rather than their noun forms
              (e.g., "decide" instead of "make a decision").
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Readability Score Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://word-counter-nine-hazel.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Word Counter
              </a>
              <a
                href="https://text-diff-checker.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Text Diff Checker
              </a>
              <a
                href="https://lorem-ipsum-three-jet.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Lorem Ipsum Generator
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

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
