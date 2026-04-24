"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "All"
  | "Arrows"
  | "Math"
  | "Currency"
  | "Greek"
  | "Punctuation"
  | "Special";

interface Entity {
  char: string;
  name: string;
  numeric: string;
  unicode: string;
  category: Exclude<Category, "All">;
}

// ─── Entity data ──────────────────────────────────────────────────────────────

const ENTITIES: Entity[] = [
  // Arrows
  { char: "←", name: "&larr;", numeric: "&#8592;", unicode: "U+2190", category: "Arrows" },
  { char: "↑", name: "&uarr;", numeric: "&#8593;", unicode: "U+2191", category: "Arrows" },
  { char: "→", name: "&rarr;", numeric: "&#8594;", unicode: "U+2192", category: "Arrows" },
  { char: "↓", name: "&darr;", numeric: "&#8595;", unicode: "U+2193", category: "Arrows" },
  { char: "↔", name: "&harr;", numeric: "&#8596;", unicode: "U+2194", category: "Arrows" },
  { char: "↕", name: "&varr;", numeric: "&#8597;", unicode: "U+2195", category: "Arrows" },
  { char: "⇐", name: "&lArr;", numeric: "&#8656;", unicode: "U+21D0", category: "Arrows" },
  { char: "⇑", name: "&uArr;", numeric: "&#8657;", unicode: "U+21D1", category: "Arrows" },
  { char: "⇒", name: "&rArr;", numeric: "&#8658;", unicode: "U+21D2", category: "Arrows" },
  { char: "⇓", name: "&dArr;", numeric: "&#8659;", unicode: "U+21D3", category: "Arrows" },
  { char: "⇔", name: "&hArr;", numeric: "&#8660;", unicode: "U+21D4", category: "Arrows" },
  { char: "↵", name: "&crarr;", numeric: "&#8629;", unicode: "U+21B5", category: "Arrows" },

  // Math
  { char: "∀", name: "&forall;", numeric: "&#8704;", unicode: "U+2200", category: "Math" },
  { char: "∂", name: "&part;", numeric: "&#8706;", unicode: "U+2202", category: "Math" },
  { char: "∃", name: "&exist;", numeric: "&#8707;", unicode: "U+2203", category: "Math" },
  { char: "∅", name: "&empty;", numeric: "&#8709;", unicode: "U+2205", category: "Math" },
  { char: "∇", name: "&nabla;", numeric: "&#8711;", unicode: "U+2207", category: "Math" },
  { char: "∈", name: "&isin;", numeric: "&#8712;", unicode: "U+2208", category: "Math" },
  { char: "∉", name: "&notin;", numeric: "&#8713;", unicode: "U+2209", category: "Math" },
  { char: "∋", name: "&ni;", numeric: "&#8715;", unicode: "U+220B", category: "Math" },
  { char: "∏", name: "&prod;", numeric: "&#8719;", unicode: "U+220F", category: "Math" },
  { char: "∑", name: "&sum;", numeric: "&#8721;", unicode: "U+2211", category: "Math" },
  { char: "−", name: "&minus;", numeric: "&#8722;", unicode: "U+2212", category: "Math" },
  { char: "∗", name: "&lowast;", numeric: "&#8727;", unicode: "U+2217", category: "Math" },
  { char: "√", name: "&radic;", numeric: "&#8730;", unicode: "U+221A", category: "Math" },
  { char: "∝", name: "&prop;", numeric: "&#8733;", unicode: "U+221D", category: "Math" },
  { char: "∞", name: "&infin;", numeric: "&#8734;", unicode: "U+221E", category: "Math" },
  { char: "∠", name: "&ang;", numeric: "&#8736;", unicode: "U+2220", category: "Math" },
  { char: "∧", name: "&and;", numeric: "&#8743;", unicode: "U+2227", category: "Math" },
  { char: "∨", name: "&or;", numeric: "&#8744;", unicode: "U+2228", category: "Math" },
  { char: "∩", name: "&cap;", numeric: "&#8745;", unicode: "U+2229", category: "Math" },
  { char: "∪", name: "&cup;", numeric: "&#8746;", unicode: "U+222A", category: "Math" },
  { char: "∫", name: "&int;", numeric: "&#8747;", unicode: "U+222B", category: "Math" },
  { char: "∴", name: "&there4;", numeric: "&#8756;", unicode: "U+2234", category: "Math" },
  { char: "∼", name: "&sim;", numeric: "&#8764;", unicode: "U+223C", category: "Math" },
  { char: "≅", name: "&cong;", numeric: "&#8773;", unicode: "U+2245", category: "Math" },
  { char: "≈", name: "&asymp;", numeric: "&#8776;", unicode: "U+2248", category: "Math" },
  { char: "≠", name: "&ne;", numeric: "&#8800;", unicode: "U+2260", category: "Math" },
  { char: "≡", name: "&equiv;", numeric: "&#8801;", unicode: "U+2261", category: "Math" },
  { char: "≤", name: "&le;", numeric: "&#8804;", unicode: "U+2264", category: "Math" },
  { char: "≥", name: "&ge;", numeric: "&#8805;", unicode: "U+2265", category: "Math" },
  { char: "⊂", name: "&sub;", numeric: "&#8834;", unicode: "U+2282", category: "Math" },
  { char: "⊃", name: "&sup;", numeric: "&#8835;", unicode: "U+2283", category: "Math" },
  { char: "⊄", name: "&nsub;", numeric: "&#8836;", unicode: "U+2284", category: "Math" },
  { char: "⊆", name: "&sube;", numeric: "&#8838;", unicode: "U+2286", category: "Math" },
  { char: "⊇", name: "&supe;", numeric: "&#8839;", unicode: "U+2287", category: "Math" },
  { char: "⊕", name: "&oplus;", numeric: "&#8853;", unicode: "U+2295", category: "Math" },
  { char: "⊗", name: "&otimes;", numeric: "&#8855;", unicode: "U+2297", category: "Math" },
  { char: "⊥", name: "&perp;", numeric: "&#8869;", unicode: "U+22A5", category: "Math" },
  { char: "·", name: "&sdot;", numeric: "&#8901;", unicode: "U+22C5", category: "Math" },
  { char: "±", name: "&plusmn;", numeric: "&#177;", unicode: "U+00B1", category: "Math" },
  { char: "×", name: "&times;", numeric: "&#215;", unicode: "U+00D7", category: "Math" },
  { char: "÷", name: "&divide;", numeric: "&#247;", unicode: "U+00F7", category: "Math" },
  { char: "¼", name: "&frac14;", numeric: "&#188;", unicode: "U+00BC", category: "Math" },
  { char: "½", name: "&frac12;", numeric: "&#189;", unicode: "U+00BD", category: "Math" },
  { char: "¾", name: "&frac34;", numeric: "&#190;", unicode: "U+00BE", category: "Math" },

  // Currency
  { char: "&", name: "&amp;", numeric: "&#38;", unicode: "U+0026", category: "Special" },
  { char: "€", name: "&euro;", numeric: "&#8364;", unicode: "U+20AC", category: "Currency" },
  { char: "£", name: "&pound;", numeric: "&#163;", unicode: "U+00A3", category: "Currency" },
  { char: "¥", name: "&yen;", numeric: "&#165;", unicode: "U+00A5", category: "Currency" },
  { char: "¢", name: "&cent;", numeric: "&#162;", unicode: "U+00A2", category: "Currency" },
  { char: "₩", name: "&#8361;", numeric: "&#8361;", unicode: "U+20A9", category: "Currency" },
  { char: "₹", name: "&#8377;", numeric: "&#8377;", unicode: "U+20B9", category: "Currency" },
  { char: "₿", name: "&#8383;", numeric: "&#8383;", unicode: "U+20BF", category: "Currency" },
  { char: "¤", name: "&curren;", numeric: "&#164;", unicode: "U+00A4", category: "Currency" },

  // Greek
  { char: "α", name: "&alpha;", numeric: "&#945;", unicode: "U+03B1", category: "Greek" },
  { char: "β", name: "&beta;", numeric: "&#946;", unicode: "U+03B2", category: "Greek" },
  { char: "γ", name: "&gamma;", numeric: "&#947;", unicode: "U+03B3", category: "Greek" },
  { char: "δ", name: "&delta;", numeric: "&#948;", unicode: "U+03B4", category: "Greek" },
  { char: "ε", name: "&epsilon;", numeric: "&#949;", unicode: "U+03B5", category: "Greek" },
  { char: "ζ", name: "&zeta;", numeric: "&#950;", unicode: "U+03B6", category: "Greek" },
  { char: "η", name: "&eta;", numeric: "&#951;", unicode: "U+03B7", category: "Greek" },
  { char: "θ", name: "&theta;", numeric: "&#952;", unicode: "U+03B8", category: "Greek" },
  { char: "ι", name: "&iota;", numeric: "&#953;", unicode: "U+03B9", category: "Greek" },
  { char: "κ", name: "&kappa;", numeric: "&#954;", unicode: "U+03BA", category: "Greek" },
  { char: "λ", name: "&lambda;", numeric: "&#955;", unicode: "U+03BB", category: "Greek" },
  { char: "μ", name: "&mu;", numeric: "&#956;", unicode: "U+03BC", category: "Greek" },
  { char: "ν", name: "&nu;", numeric: "&#957;", unicode: "U+03BD", category: "Greek" },
  { char: "ξ", name: "&xi;", numeric: "&#958;", unicode: "U+03BE", category: "Greek" },
  { char: "ο", name: "&omicron;", numeric: "&#959;", unicode: "U+03BF", category: "Greek" },
  { char: "π", name: "&pi;", numeric: "&#960;", unicode: "U+03C0", category: "Greek" },
  { char: "ρ", name: "&rho;", numeric: "&#961;", unicode: "U+03C1", category: "Greek" },
  { char: "σ", name: "&sigma;", numeric: "&#963;", unicode: "U+03C3", category: "Greek" },
  { char: "τ", name: "&tau;", numeric: "&#964;", unicode: "U+03C4", category: "Greek" },
  { char: "υ", name: "&upsilon;", numeric: "&#965;", unicode: "U+03C5", category: "Greek" },
  { char: "φ", name: "&phi;", numeric: "&#966;", unicode: "U+03C6", category: "Greek" },
  { char: "χ", name: "&chi;", numeric: "&#967;", unicode: "U+03C7", category: "Greek" },
  { char: "ψ", name: "&psi;", numeric: "&#968;", unicode: "U+03C8", category: "Greek" },
  { char: "ω", name: "&omega;", numeric: "&#969;", unicode: "U+03C9", category: "Greek" },
  { char: "Α", name: "&Alpha;", numeric: "&#913;", unicode: "U+0391", category: "Greek" },
  { char: "Β", name: "&Beta;", numeric: "&#914;", unicode: "U+0392", category: "Greek" },
  { char: "Γ", name: "&Gamma;", numeric: "&#915;", unicode: "U+0393", category: "Greek" },
  { char: "Δ", name: "&Delta;", numeric: "&#916;", unicode: "U+0394", category: "Greek" },
  { char: "Θ", name: "&Theta;", numeric: "&#920;", unicode: "U+0398", category: "Greek" },
  { char: "Λ", name: "&Lambda;", numeric: "&#923;", unicode: "U+039B", category: "Greek" },
  { char: "Π", name: "&Pi;", numeric: "&#928;", unicode: "U+03A0", category: "Greek" },
  { char: "Σ", name: "&Sigma;", numeric: "&#931;", unicode: "U+03A3", category: "Greek" },
  { char: "Φ", name: "&Phi;", numeric: "&#934;", unicode: "U+03A6", category: "Greek" },
  { char: "Ψ", name: "&Psi;", numeric: "&#936;", unicode: "U+03A8", category: "Greek" },
  { char: "Ω", name: "&Omega;", numeric: "&#937;", unicode: "U+03A9", category: "Greek" },

  // Punctuation
  { char: "<", name: "&lt;", numeric: "&#60;", unicode: "U+003C", category: "Punctuation" },
  { char: ">", name: "&gt;", numeric: "&#62;", unicode: "U+003E", category: "Punctuation" },
  { char: '"', name: "&quot;", numeric: "&#34;", unicode: "U+0022", category: "Punctuation" },
  { char: "'", name: "&apos;", numeric: "&#39;", unicode: "U+0027", category: "Punctuation" },
  { char: "–", name: "&ndash;", numeric: "&#8211;", unicode: "U+2013", category: "Punctuation" },
  { char: "—", name: "&mdash;", numeric: "&#8212;", unicode: "U+2014", category: "Punctuation" },
  { char: "\u2018", name: "&lsquo;", numeric: "&#8216;", unicode: "U+2018", category: "Punctuation" },
  { char: "\u2019", name: "&rsquo;", numeric: "&#8217;", unicode: "U+2019", category: "Punctuation" },
  { char: "\u201C", name: "&ldquo;", numeric: "&#8220;", unicode: "U+201C", category: "Punctuation" },
  { char: "\u201D", name: "&rdquo;", numeric: "&#8221;", unicode: "U+201D", category: "Punctuation" },
  { char: "„", name: "&bdquo;", numeric: "&#8222;", unicode: "U+201E", category: "Punctuation" },
  { char: "‹", name: "&lsaquo;", numeric: "&#8249;", unicode: "U+2039", category: "Punctuation" },
  { char: "›", name: "&rsaquo;", numeric: "&#8250;", unicode: "U+203A", category: "Punctuation" },
  { char: "«", name: "&laquo;", numeric: "&#171;", unicode: "U+00AB", category: "Punctuation" },
  { char: "»", name: "&raquo;", numeric: "&#187;", unicode: "U+00BB", category: "Punctuation" },
  { char: "…", name: "&hellip;", numeric: "&#8230;", unicode: "U+2026", category: "Punctuation" },
  { char: "·", name: "&middot;", numeric: "&#183;", unicode: "U+00B7", category: "Punctuation" },
  { char: "¶", name: "&para;", numeric: "&#182;", unicode: "U+00B6", category: "Punctuation" },
  { char: "§", name: "&sect;", numeric: "&#167;", unicode: "U+00A7", category: "Punctuation" },
  { char: "†", name: "&dagger;", numeric: "&#8224;", unicode: "U+2020", category: "Punctuation" },
  { char: "‡", name: "&Dagger;", numeric: "&#8225;", unicode: "U+2021", category: "Punctuation" },

  // Special
  { char: " ", name: "&nbsp;", numeric: "&#160;", unicode: "U+00A0", category: "Special" },
  { char: "©", name: "&copy;", numeric: "&#169;", unicode: "U+00A9", category: "Special" },
  { char: "®", name: "&reg;", numeric: "&#174;", unicode: "U+00AE", category: "Special" },
  { char: "™", name: "&trade;", numeric: "&#8482;", unicode: "U+2122", category: "Special" },
  { char: "°", name: "&deg;", numeric: "&#176;", unicode: "U+00B0", category: "Special" },
  { char: "µ", name: "&micro;", numeric: "&#181;", unicode: "U+00B5", category: "Special" },
  { char: "¹", name: "&sup1;", numeric: "&#185;", unicode: "U+00B9", category: "Special" },
  { char: "²", name: "&sup2;", numeric: "&#178;", unicode: "U+00B2", category: "Special" },
  { char: "³", name: "&sup3;", numeric: "&#179;", unicode: "U+00B3", category: "Special" },
  { char: "♠", name: "&spades;", numeric: "&#9824;", unicode: "U+2660", category: "Special" },
  { char: "♣", name: "&clubs;", numeric: "&#9827;", unicode: "U+2663", category: "Special" },
  { char: "♥", name: "&hearts;", numeric: "&#9829;", unicode: "U+2665", category: "Special" },
  { char: "♦", name: "&diams;", numeric: "&#9830;", unicode: "U+2666", category: "Special" },
  { char: "★", name: "&#9733;", numeric: "&#9733;", unicode: "U+2605", category: "Special" },
  { char: "☆", name: "&#9734;", numeric: "&#9734;", unicode: "U+2606", category: "Special" },
  { char: "✓", name: "&#10003;", numeric: "&#10003;", unicode: "U+2713", category: "Special" },
  { char: "✗", name: "&#10007;", numeric: "&#10007;", unicode: "U+2717", category: "Special" },
  { char: "•", name: "&bull;", numeric: "&#8226;", unicode: "U+2022", category: "Special" },
  { char: "◦", name: "&#9702;", numeric: "&#9702;", unicode: "U+25E6", category: "Special" },
  { char: "¿", name: "&iquest;", numeric: "&#191;", unicode: "U+00BF", category: "Special" },
  { char: "¡", name: "&iexcl;", numeric: "&#161;", unicode: "U+00A1", category: "Special" },
];

const CATEGORIES: Category[] = ["All", "Arrows", "Math", "Currency", "Greek", "Punctuation", "Special"];

// ─── EntityCard ───────────────────────────────────────────────────────────────

function EntityCard({ entity }: { entity: Entity }) {
  const [copied, setCopied] = useState<"char" | "name" | "numeric" | null>(null);

  const copy = async (text: string, field: "char" | "name" | "numeric") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1200);
  };

  const isNbsp = entity.char === " ";
  const displayChar = isNbsp ? "\u00A0·\u00A0" : entity.char;

  return (
    <div
      className="group relative rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-blue-500 hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => copy(entity.char, "char")}
      title={`Click to copy character: ${entity.char}`}
    >
      {/* Copy flash */}
      {copied === "char" && (
        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center rounded-xl z-10 pointer-events-none">
          <span className="text-blue-600 font-semibold text-xs">Copied!</span>
        </div>
      )}

      <div className="p-3 flex flex-col items-center gap-1">
        {/* Character */}
        <div className="text-3xl leading-none select-none" aria-label={entity.unicode}>
          {displayChar}
        </div>

        {/* Entity name */}
        <div
          className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate w-full text-center mt-1 hover:underline cursor-copy"
          onClick={(e) => { e.stopPropagation(); copy(entity.name, "name"); }}
          title={`Copy entity name: ${entity.name}`}
        >
          {copied === "name" ? "Copied!" : entity.name}
        </div>

        {/* Numeric code */}
        <div
          className="text-[10px] font-mono text-[var(--muted-fg)] truncate w-full text-center hover:text-[var(--foreground)] cursor-copy"
          onClick={(e) => { e.stopPropagation(); copy(entity.numeric, "numeric"); }}
          title={`Copy numeric code: ${entity.numeric}`}
        >
          {copied === "numeric" ? "Copied!" : entity.numeric}
        </div>

        {/* Unicode */}
        <div className="text-[9px] text-[var(--muted-fg)] opacity-60">
          {entity.unicode}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HtmlEntitiesReference() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ENTITIES.filter((e) => {
      const matchesCategory = category === "All" || e.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.char.includes(q) ||
        e.numeric.toLowerCase().includes(q) ||
        e.unicode.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  return (
    <div className="space-y-6">
      {/* Search + category filters */}
      <div className="space-y-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, character, numeric code, or Unicode..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--muted)] text-[var(--muted-fg)] hover:bg-[var(--border)]"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1 opacity-60">
                  ({ENTITIES.filter((e) => e.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-[var(--muted-fg)]">
        {filtered.length} {filtered.length === 1 ? "entity" : "entities"}
        {search && ` matching "${search}"`}
        {" — "}
        <span className="opacity-70">Click character to copy · Click name or code to copy that</span>
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
          {filtered.map((entity) => (
            <EntityCard key={`${entity.unicode}-${entity.name}`} entity={entity} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-fg)]">
          <span className="text-4xl mb-3">∅</span>
          <p className="text-sm">No entities found for &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--muted-fg)] text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this HTML Entities Reference tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Searchable reference of all HTML character entities. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this HTML Entities Reference tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Searchable reference of all HTML character entities. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HTML Entities Reference",
  "description": "Searchable reference of all HTML character entities",
  "url": "https://tools.loresync.dev/html-entities-reference",
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
