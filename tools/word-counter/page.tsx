import WordCounter from "./components/WordCounter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Word Counter
        </h1>
        <p className="mb-6 text-base" style={{ color: "var(--muted)" }}>
          Count words, characters, sentences, paragraphs, and estimate reading
          time instantly.
        </p>

        <WordCounter />

        {/* AdSense Placeholder */}
        <div
          className="my-8 flex items-center justify-center rounded-xl border-2 border-dashed p-8 text-sm"
          style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
        >
          Advertisement
        </div>

        {/* SEO Content */}
        <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Why Word Count Matters
          </h2>
          <p className="mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            Whether you are writing a blog post, an academic essay, or a social
            media update, knowing your word count is essential. Many platforms
            enforce strict character limits, and search engines favor content
            that meets certain length thresholds. A well-calibrated word count
            helps you communicate your message effectively without overwhelming
            or under-serving your audience. Our free word counter tool gives you
            real-time feedback as you type, so you never have to guess.
          </p>

          <h2 className="text-2xl font-bold mb-4">
            Social Media Character Limits
          </h2>
          <p className="mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            Every social media platform has its own character limit. Twitter (now
            X) allows 280 characters per tweet, making brevity crucial.
            Instagram captions can be up to 2,200 characters, giving you more
            room for storytelling and hashtags. LinkedIn posts support up to
            3,000 characters, ideal for professional insights and thought
            leadership. Exceeding these limits means your content gets cut off or
            rejected entirely. Use the social media limit tracker above to see
            exactly how much space you have left for each platform before you
            publish.
          </p>

          <h2 className="text-2xl font-bold mb-4">
            SEO and Content Length
          </h2>
          <p className="mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            Search engine optimization depends partly on content length.
            Research suggests that long-form articles of 1,500 to 2,500 words
            tend to rank higher in search results because they provide
            comprehensive coverage of a topic. However, quality always trumps
            quantity. Thin content stuffed with keywords will hurt your rankings,
            while well-structured, informative content earns backlinks and
            engagement. Use the keyword density feature to make sure your most
            important terms appear naturally throughout your text without
            over-optimization.
          </p>

          <h2 className="text-2xl font-bold mb-4">
            Reading Time and Audience Engagement
          </h2>
          <p className="mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            The average adult reads at about 200 words per minute and speaks at
            roughly 130 words per minute. Knowing your estimated reading and
            speaking time helps you plan presentations, podcast scripts, and
            articles that fit your audience&apos;s attention span. Blog posts
            that take 5 to 7 minutes to read tend to receive the most
            engagement. For presentations and speeches, timing your content
            ensures you stay within your allotted slot. This tool calculates
            both metrics automatically so you can plan your content with
            confidence.
          </p>

          <h2 className="text-2xl font-bold mb-4">
            How to Use This Tool
          </h2>
          <p className="mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            Simply type or paste your text into the input area above. All
            statistics update in real time as you type. The stats cards show your
            word count, character count with and without spaces, sentence count,
            paragraph count, and line count. Below the text area, you will find
            the social media character limit tracker and the keyword density
            table. Use the copy button to quickly copy your text to the
            clipboard, or the clear button to start fresh. No data is sent to
            any server. Everything runs entirely in your browser for complete
            privacy.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Word Counter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/text-diff" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Diff</a>
              <a href="/markdown-preview" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Preview</a>
              <a href="/dummy-text" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Dummy Text</a>
              <a href="/mdtable" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Table</a>
              <a href="/html-to-markdown" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML to Markdown</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Word Counter",
  "description": "Word Counter — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/word-counter",
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
