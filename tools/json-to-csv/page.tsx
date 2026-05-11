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
import JsonToCsv from "./components/JsonToCsv";

const faq: FaqItem[] = [
  {
    q: "Is pasted JSON uploaded?",
    a: "No. JSON parsing, flattening, CSV generation, and downloads are handled in your browser.",
  },
  {
    q: "Can nested objects be converted?",
    a: "Yes. Nested object keys are flattened with dot notation so spreadsheet columns remain readable.",
  },
  {
    q: "Which delimiters are supported?",
    a: "The converter supports comma, tab, and semicolon delimiters, plus quoting options for spreadsheet compatibility.",
  },
  {
    q: "Can CSV be converted back to JSON?",
    a: "Yes. Switch to CSV-to-JSON mode to parse rows into JSON objects using the first row as headers.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader
          eyebrow="Data format tools"
          title="JSON to CSV Converter"
          description="Paste JSON, preview the flattened table, convert it to CSV, and download or copy the result without leaving your browser."
          noteTitle="Private data handling"
          note="Conversion runs locally. Your JSON and CSV output are not sent to cc-tools."
          tone="emerald"
        />

        <JsonToCsv />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Table preview" body="Inspect generated columns and rows before copying or downloading the CSV." />
          <InfoCard title="Nested key flattening" body="Turn nested JSON objects into spreadsheet-friendly dot notation columns." />
          <InfoCard title="Example-ready workflow" body="Start with a small JSON array, confirm the columns, then paste the larger export." />
        </section>

        <InfoSection
          title="Conversion Workflow"
          items={[
            [
              "Valid JSON input",
              "Use a JSON array of objects for best results. The tool reports parse errors when input is malformed.",
            ],
            [
              "Column generation",
              "Keys are collected across rows, nested fields are flattened, and missing values are left empty in the CSV.",
            ],
            [
              "CSV compatibility",
              "Choose delimiter and quote settings based on Excel, Google Sheets, database import, or regional spreadsheet preferences.",
            ],
            [
              "Local downloads",
              "Generated CSV and JSON files are created in the browser from the current output.",
            ],
          ]}
        />

        <Faq items={faq} />
        <RelatedSection
          links={[
            ["/json-formatter", "JSON Formatter", "Format and validate JSON"],
            ["/yaml-to-json", "YAML to JSON", "Convert YAML data"],
            ["/xml-formatter", "XML Formatter", "Format XML data"],
            ["/mdtable", "Markdown Table", "Build Markdown tables"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools includes {toolCount} free online tools.
        </footer>
      </div>

      <JsonLd
        faq={faq}
        name="JSON to CSV Converter"
        description="Convert JSON to CSV, preview tables, download CSV, and convert CSV back to JSON locally."
        url="https://tools.loresync.dev/json-to-csv"
        inLanguage="en"
      />
    </main>
  );
}
