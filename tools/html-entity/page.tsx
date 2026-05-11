import { tools } from "@/lib/tools-config";
import {
  Faq,
  InfoCard,
  InfoSection,
  JsonLd,
  RelatedSection,
  ToolHeader,
  type FaqItem,
} from "@/components/ToolPageSections";
import HtmlEntity from "./components/HtmlEntity";

const faq: FaqItem[] = [
  {
    q: "What are HTML entities used for?",
    a: "HTML entities represent reserved characters such as less-than, greater-than, ampersand, quotes, and symbols in a safe text form.",
  },
  {
    q: "Does the encoder send my text to a server?",
    a: "No. Encoding and decoding runs in your browser, so pasted text stays local to the page.",
  },
  {
    q: "Should I use named or numeric entities?",
    a: "Named entities are easier to read for common symbols. Numeric and hexadecimal entities work well for broader Unicode characters.",
  },
  {
    q: "Can this prevent every XSS problem?",
    a: "No. Entity encoding helps when rendering text in HTML, but security-sensitive apps should use framework escaping and context-aware sanitization.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader
          eyebrow="HTML and text tools"
          title="HTML Entity Encoder / Decoder"
          description="Encode text into HTML entities, decode entities back to readable characters, and copy common named, numeric, and hexadecimal references."
          noteTitle="Local text conversion"
          note="The conversion is performed in your browser. Pasted text is not uploaded."
          tone="amber"
        />

        <HtmlEntity />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Encode reserved characters" body="Convert symbols such as <, >, &, quotes, and currency marks into HTML-safe text." />
          <InfoCard title="Decode pasted entities" body="Turn named, numeric, and hexadecimal entity references back into readable characters." />
          <InfoCard title="Example snippets" body="Try &amp;lt;div&amp;gt;, &amp;copy;, or &#169; to compare named and numeric forms." />
        </section>

        <InfoSection
          title="Entity Encoding Guide"
          items={[
            [
              "Reserved HTML characters",
              "Characters such as less-than and ampersand can change markup meaning, so they should be encoded when displayed as text.",
            ],
            [
              "Named entities",
              "Readable names such as amp, lt, gt, quot, copy, and reg are convenient for common symbols.",
            ],
            [
              "Numeric entities",
              "Decimal and hexadecimal forms reference Unicode code points and are useful when no common named entity exists.",
            ],
            [
              "Validation",
              "Malformed entity text remains visible, making it easier to spot input that needs manual cleanup.",
            ],
            [
              "Clear and reset",
              "Clear the input field when you want to reset the preview and start a fresh conversion.",
            ],
          ]}
        />

        <Faq items={faq} />
        <RelatedSection
          links={[
            ["/html-to-markdown", "HTML to Markdown", "Convert HTML documents"],
            ["/xml-formatter", "XML Formatter", "Format XML markup"],
            ["/url-encoder", "URL Encoder", "Encode URL components"],
            ["/base64-tools", "Base64 Tools", "Encode and decode Base64"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools includes {toolCount} free online tools.
        </footer>
      </div>

      <JsonLd
        faq={faq}
        name="HTML Entity Encoder / Decoder"
        description="Encode and decode HTML entities locally in the browser."
        url="https://tools.loresync.dev/html-entity"
        inLanguage="en"
      />
    </main>
  );
}
