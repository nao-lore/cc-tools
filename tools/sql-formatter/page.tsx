import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import SqlFormatter from "./components/SqlFormatter";

const faq: FaqItem[] = [
  { q: "Is SQL sent to a server?", a: "No. Formatting, minifying, syntax highlighting, validation messages, reset, and copy actions run locally in your browser." },
  { q: "Can I minify SQL too?", a: "Yes. Use the minify option when you need a compact single-line query for logs, examples, or embedded code." },
  { q: "Which SQL dialects are supported?", a: "The formatter targets common SQL structure used by PostgreSQL, MySQL, SQLite, SQL Server, and similar relational databases." },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader eyebrow="Developer formatter" title="SQL Formatter" description="Paste SQL, validate syntax-like structure, choose casing and indentation, reset the editor, and copy readable or minified output." tone="violet" noteTitle="Browser-only formatting" note="Queries stay local while formatting, highlighting, minifying, clearing, and copying." />
        <SqlFormatter />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Review-friendly SQL" body="Format SELECT, JOIN, WHERE, GROUP BY, and CASE blocks for code review." />
          <InfoCard title="Minify option" body="Compress a query into one line for examples, fixtures, or log comparison." />
          <InfoCard title="Copy output" body="Copy the formatted SQL into docs, migrations, dashboards, or tickets." />
        </section>
        <InfoSection title="SQL Formatting Notes" items={[["Readable diffs", "Put major clauses and selected columns on separate lines so query changes are easier to review."], ["Vendor syntax", "Dialect-specific extensions may need manual adjustment after automatic formatting."]]} />
        <Faq items={faq} />
        <RelatedSection links={[["/json-formatter", "JSON Formatter", "Format JSON"], ["/xml-formatter", "XML Formatter", "Format XML"], ["/yaml-to-json", "YAML to JSON", "Convert config"], ["/regex-tester", "Regex Tester", "Test patterns"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>
      <JsonLd faq={faq} name="SQL Formatter" description="Format and minify SQL locally with validation, reset, syntax highlighting, and copy-ready output." url="https://tools.loresync.dev/sql-formatter" category="DeveloperApplication" />
    </main>
  );
}
