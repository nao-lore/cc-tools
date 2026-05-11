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
import XmlFormatter from "./components/XmlFormatter";

const faq: FaqItem[] = [
  {
    q: "Does XML formatting run locally?",
    a: "Yes. Formatting, minifying, validation, and copy actions run in your browser.",
  },
  {
    q: "Can this validate XML syntax?",
    a: "Yes. The tool checks whether the XML is well-formed and reports parsing errors when the browser parser finds them.",
  },
  {
    q: "Does formatting change the XML data?",
    a: "Pretty printing changes whitespace between tags for readability. Minify removes extra whitespace, so review whitespace-sensitive documents before saving.",
  },
  {
    q: "Which indent styles are supported?",
    a: "You can choose common indentation styles such as two spaces, four spaces, or tabs.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader
          eyebrow="Data format tools"
          title="XML Formatter"
          description="Format, beautify, validate, and minify XML with syntax highlighting and copy-ready output."
          noteTitle="Browser-only parser"
          note="Your XML is parsed and formatted in the browser. It is not uploaded for server-side processing."
          tone="sky"
        />

        <XmlFormatter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Pretty print" body="Add consistent line breaks and indentation to compact XML." />
          <InfoCard title="Minify" body="Remove unnecessary spacing for smaller XML payloads." />
          <InfoCard title="Example input" body="Paste a compact RSS item, SVG snippet, or SOAP response to check formatting quickly." />
        </section>

        <InfoSection
          title="XML Formatting Notes"
          items={[
            [
              "Strict syntax",
              "XML requires closed tags, quoted attributes, and correctly nested elements. The validator helps catch these mistakes.",
            ],
            [
              "Whitespace caution",
              "Most XML ignores formatting whitespace, but text-heavy or whitespace-sensitive documents should be reviewed after minifying.",
            ],
            [
              "Common inputs",
              "Use it for RSS, SVG, SOAP, Android layouts, build files, and configuration documents.",
            ],
            [
              "Privacy",
              "The browser DOM parser handles the content locally, so private XML is not sent over the network by this page.",
            ],
          ]}
        />

        <Faq items={faq} />
        <RelatedSection
          links={[
            ["/json-formatter", "JSON Formatter", "Format and validate JSON"],
            ["/sql-formatter", "SQL Formatter", "Format SQL queries"],
            ["/yaml-to-json", "YAML to JSON", "Convert YAML data"],
            ["/html-entity", "HTML Entity", "Encode HTML entities"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools includes {toolCount} free online tools.
        </footer>
      </div>

      <JsonLd
        faq={faq}
        name="XML Formatter"
        description="Format, validate, minify, and copy XML locally in the browser."
        url="https://tools.loresync.dev/xml-formatter"
        inLanguage="en"
      />
    </main>
  );
}
