import Link from "next/link";

export type FaqItem = {
  q: string;
  a: string;
};

export function ToolHeader({
  eyebrow,
  title,
  description,
  noteTitle,
  note,
  tone = "slate",
  locale = "en",
}: {
  eyebrow: string;
  title: string;
  description: string;
  noteTitle: string;
  note: string;
  tone?: "sky" | "emerald" | "violet" | "amber" | "rose" | "cyan" | "slate" | "lime" | "orange";
  locale?: "en" | "ja";
}) {
  const toneClass = {
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-900",
    lime: "border-lime-200 bg-lime-50 text-lime-900",
    orange: "border-orange-200 bg-orange-50 text-orange-900",
    slate: "border-slate-200 bg-white text-slate-600",
  }[tone];

  return (
    <header className="mb-6">
      <Link href="/" aria-label="Back to free online tools" className="text-sm font-medium text-slate-500 hover:text-slate-950">
        {locale === "ja" ? "← 無料オンラインツール集" : "← Free online tools"}
      </Link>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-slate-600">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
        </div>
        <div className={`rounded-2xl border p-4 text-sm leading-6 shadow-sm ${toneClass}`}>
          <div className="font-semibold text-slate-950">{noteTitle}</div>
          <p className="mt-2">{note}</p>
        </div>
      </div>
    </header>
  );
}

export function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

export function InfoSection({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
        {items.map(([heading, body]) => (
          <div key={heading}>
            <h3 className="font-semibold text-slate-900">{heading}</h3>
            <p className="mt-1">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-950">FAQ</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {items.map((item) => (
          <div key={item.q} className="py-4 first:pt-0 last:pb-0">
            <h3 className="font-semibold text-slate-950">{item.q}</h3>
            <p className="mt-1 text-sm leading-7 text-slate-600">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RelatedSection({ links, locale = "en" }: { links: [string, string, string][]; locale?: "en" | "ja" }) {
  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-950">{locale === "ja" ? "関連ツール" : "Related Tools"}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map(([href, title, body]) => (
          <Link key={href} href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">
            <div className="text-sm font-semibold text-slate-950">{title}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function JsonLd({
  faq,
  name,
  description,
  url,
  category = "UtilityApplication",
  inLanguage,
}: {
  faq: FaqItem[];
  name: string;
  description: string;
  url: string;
  category?: string;
  inLanguage?: string;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name,
            description,
            url,
            applicationCategory: category,
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
            ...(inLanguage ? { inLanguage } : {}),
          }),
        }}
      />
    </>
  );
}
