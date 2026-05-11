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
import MetaTagGenerator from "./components/MetaTagGenerator";

const faq: FaqItem[] = [
  {
    q: "What tags does this generator create?",
    a: "It creates common SEO meta tags, Open Graph tags, Twitter Card tags, robots directives, canonical URL markup, and copy-ready HTML.",
  },
  {
    q: "Is the entered page data uploaded?",
    a: "No. The preview and generated HTML are built in your browser.",
  },
  {
    q: "How long should a meta description be?",
    a: "A practical target is roughly 120 to 160 characters. The exact display can vary by search result layout and query.",
  },
  {
    q: "Do meta tags guarantee search ranking?",
    a: "No. Good tags improve clarity and click-through potential, but ranking also depends on content quality, intent match, links, performance, and technical SEO.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader
          eyebrow="SEO tools"
          title="Meta Tag Generator"
          description="Generate SEO, Open Graph, Twitter Card, robots, and canonical meta tags with live preview and copy-ready HTML."
          noteTitle="Preview before publishing"
          note="Review title length, description length, image URL, and robots settings before adding tags to production pages."
          tone="lime"
        />

        <MetaTagGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Search preview" body="Check how title and description may read before adding tags to your page." />
          <InfoCard title="Social previews" body="Build Open Graph and Twitter Card markup for share cards." />
          <InfoCard title="Copy-ready output" body="Generate formatted HTML that can be pasted into your document head." />
        </section>

        <InfoSection
          title="Meta Tag Checklist"
          items={[
            [
              "Title and description",
              "Keep each page unique and write for the user's search intent instead of stuffing keywords.",
            ],
            [
              "Canonical URL",
              "Set the preferred URL when duplicate or near-duplicate pages can exist.",
            ],
            [
              "Open Graph image",
              "Use a clear image with enough resolution for social sharing, commonly around 1200 by 630 pixels.",
            ],
            [
              "Privacy",
              "Entered values are used only to render the preview and HTML in the browser.",
            ],
          ]}
        />

        <Faq items={faq} />
        <RelatedSection
          links={[
            ["/og-image-preview", "OG Image Preview", "Preview social cards"],
            ["/robots-txt-generator", "Robots.txt Generator", "Create crawl directives"],
            ["/html-entity", "HTML Entity", "Encode special characters"],
            ["/json-formatter", "JSON Formatter", "Format structured data"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools includes {toolCount} free online tools.
        </footer>
      </div>

      <JsonLd
        faq={faq}
        name="Meta Tag Generator"
        description="Generate SEO, Open Graph, Twitter Card, robots, and canonical meta tags with local preview."
        url="https://tools.loresync.dev/meta-tag-generator"
        category="SEOApplication"
        inLanguage="en"
      />
    </main>
  );
}
