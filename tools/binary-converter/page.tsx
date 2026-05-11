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
import BinaryConverter from "./components/BinaryConverter";

const faq: FaqItem[] = [
  {
    q: "Which number bases are supported?",
    a: "The converter supports binary, decimal, hexadecimal, octal, ASCII text, and two's complement display for negative integers.",
  },
  {
    q: "Does the conversion happen locally?",
    a: "Yes. Values are converted in your browser and are not sent to a server.",
  },
  {
    q: "What is two's complement?",
    a: "Two's complement is the standard binary representation for signed integers. It makes addition and subtraction work consistently for negative values.",
  },
  {
    q: "Can I use this for programming and debugging?",
    a: "Yes. It is useful for bit masks, color values, file permissions, protocol debugging, and checking base conversions while coding.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader
          eyebrow="Developer conversion tools"
          title="Binary Converter"
          description="Convert between binary, decimal, hexadecimal, octal, ASCII, and signed integer representations with instant validation."
          noteTitle="Client-side conversion"
          note="The calculator runs in your browser and keeps entered values local to the page."
          tone="slate"
        />

        <BinaryConverter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Base conversion" body="Move between base 2, base 8, base 10, and base 16 without manual arithmetic." />
          <InfoCard title="Signed integers" body="Check negative values with two's complement bit patterns." />
          <InfoCard title="ASCII helper" body="Convert text and character codes while debugging binary payloads." />
        </section>

        <InfoSection
          title="Number Base Reference"
          items={[
            [
              "Binary",
              "Binary uses digits 0 and 1. Each position represents a power of two, which maps directly to bits in memory and protocols.",
            ],
            [
              "Hexadecimal",
              "Hex uses digits 0-9 and A-F. One hex digit represents four bits, so it is compact for byte values and memory addresses.",
            ],
            [
              "Octal",
              "Octal uses digits 0-7 and still appears in Unix permissions, where modes such as 755 map to read, write, and execute flags.",
            ],
            [
              "Validation",
              "Invalid digits are rejected for the selected base, so decimal-only, hex-only, and binary-only inputs stay clear.",
            ],
          ]}
        />

        <Faq items={faq} />
        <RelatedSection
          links={[
            ["/chmod-calculator", "Chmod Calculator", "Decode Unix permissions"],
            ["/epoch-converter", "Epoch Converter", "Convert Unix timestamps"],
            ["/hash-generator", "Hash Generator", "Generate hashes locally"],
            ["/base64-tools", "Base64 Tools", "Encode and decode Base64"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools includes {toolCount} free online tools.
        </footer>
      </div>

      <JsonLd
        faq={faq}
        name="Binary Converter"
        description="Convert binary, decimal, hexadecimal, octal, ASCII, and signed integer values in the browser."
        url="https://tools.loresync.dev/binary-converter"
        inLanguage="en"
      />
    </main>
  );
}
