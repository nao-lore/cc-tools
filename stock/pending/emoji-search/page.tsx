import EmojiSearch from "./components/EmojiSearch";

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
            Emoji Search & Copy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search 500+ emojis by name or keyword. Click any emoji to copy it
            to your clipboard. Browse by category. Recently copied emojis are
            saved locally.
          </p>
        </div>

        {/* Tool */}
        <EmojiSearch />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use the Emoji Search Tool
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Type any word into the search box to instantly filter emojis by name or
            keyword. For example, searching "fire" shows 🔥 and related emojis.
            Searching "happy" shows all smiling and joyful faces. Click any emoji to
            copy it — a "Copied!" notification confirms the action. Then paste it
            anywhere: messages, documents, social media, or code comments.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Use the category tabs to browse by theme: Smileys &amp; Emotions, People
            &amp; Body, Animals &amp; Nature, Food &amp; Drink, Travel &amp; Places,
            Activities, Objects, and Symbols. Combining a category filter with a search
            query narrows results further — for instance, selecting "Food" and typing
            "spicy" finds 🌶️ and hot peppers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recently Copied Emojis
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The tool remembers the last 12 emojis you copied, storing them in your
            browser's local storage. No data is sent to any server. Your recently used
            emojis appear at the top for quick re-access — perfect if you frequently use
            the same set of emojis across conversations or documents.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unicode Codepoints
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Hover over any emoji to see its official Unicode name and codepoint (e.g.,
            U+1F600 for 😀). This is useful for developers who need to reference emoji
            characters in code, HTML entities, or database fields. Some emojis are
            multi-codepoint sequences — the tool displays all component codepoints.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Find the perfect emoji for social media posts, messages, or emails without
              leaving your browser.
            </li>
            <li>
              Copy emojis for use in Slack, Discord, Notion, or any app that supports
              Unicode text.
            </li>
            <li>
              Look up Unicode codepoints for emoji characters in web development or
              data processing.
            </li>
            <li>
              Quickly re-use frequently needed emojis via the recently copied section.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Emoji Search — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="//tools/text-counter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Character Counter
              </a>
              <a
                href="//tools/unicode-converter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Unicode Converter
              </a>
              <a
                href="//tools/base64"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Base64 Encoder
              </a>
              <a
                href="//tools/url-encoder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                URL Encoder
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
