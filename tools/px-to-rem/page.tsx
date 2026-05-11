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
import PxRemConverter from "./components/PxRemConverter";

const faq: FaqItem[] = [
  {
    q: "How do you convert px to rem?",
    a: "Divide the pixel value by the root font size. With a 16px root, 24px becomes 1.5rem.",
  },
  {
    q: "How do you convert rem to px?",
    a: "Multiply the rem value by the root font size. With a 16px root, 1.25rem becomes 20px.",
  },
  {
    q: "Why use rem units?",
    a: "Rem units scale with the user's root font size setting, which helps typography and spacing remain accessible.",
  },
  {
    q: "Does the converter store input values?",
    a: "No. Conversions are calculated locally in the browser and are not sent to a server.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader
          eyebrow="CSS design tools"
          title="PX to REM Converter"
          description="Convert pixels to rem, rem to pixels, bulk CSS values, and quick reference sizes with a custom root font size."
          noteTitle="Formula-based conversion"
          note="The conversion is deterministic: rem equals px divided by the root font size."
          tone="violet"
        />

        <PxRemConverter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Custom base size" body="Use 16px defaults or match your app's html font-size." />
          <InfoCard title="Bulk conversion" body="Convert multiple CSS values at once for refactors and design-system cleanup." />
          <InfoCard title="Example values" body="Try 12px, 16px, 24px, 32px, or 1.5rem to verify common design tokens." />
        </section>

        <InfoSection
          title="PX and REM Basics"
          items={[
            [
              "Root-relative sizing",
              "One rem equals the root element font size. In many browsers this starts at 16px unless the site or user changes it.",
            ],
            [
              "Accessibility",
              "Rem-based font sizes and spacing can scale with user preferences, improving readability for people who need larger text.",
            ],
            [
              "When px still helps",
              "Use px for borders, hairlines, and fine visual details that should not scale with text size.",
            ],
            [
              "Validation",
              "The converter keeps numeric inputs bounded and clear, so invalid values do not produce misleading CSS.",
            ],
          ]}
        />

        <Faq items={faq} />
        <RelatedSection
          links={[
            ["/tailwindconvert", "Tailwind Converter", "Convert CSS to Tailwind"],
            ["/css-grid", "CSS Grid", "Build grid layouts"],
            ["/css-flexbox", "CSS Flexbox", "Build flex layouts"],
            ["/color-converter", "Color Converter", "Convert color formats"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools includes {toolCount} free online tools.
        </footer>
      </div>

      <JsonLd
        faq={faq}
        name="PX to REM Converter"
        description="Convert px to rem, rem to px, and bulk CSS values with a custom base font size."
        url="https://tools.loresync.dev/px-to-rem"
        inLanguage="en"
      />
    </main>
  );
}
