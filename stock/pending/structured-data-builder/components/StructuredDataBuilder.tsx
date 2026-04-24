"use client";

import { useState, useCallback } from "react";

type SchemaType = "Article" | "Product" | "FAQ" | "BreadcrumbList" | "LocalBusiness";

interface FAQItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FormData {
  // Article
  headline: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  publisherName: string;
  publisherLogo: string;
  articleBody: string;
  // Product
  productName: string;
  productDescription: string;
  price: string;
  currency: string;
  availability: string;
  brand: string;
  sku: string;
  ratingValue: string;
  reviewCount: string;
  // FAQ
  faqItems: FAQItem[];
  // BreadcrumbList
  breadcrumbs: BreadcrumbItem[];
  // LocalBusiness
  businessName: string;
  businessType: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  telephone: string;
  businessUrl: string;
  openingHours: string;
}

const SCHEMA_TYPES: { value: SchemaType; label: string; description: string }[] = [
  { value: "Article", label: "Article", description: "News, blog posts, how-to guides" },
  { value: "Product", label: "Product", description: "E-commerce products with price & reviews" },
  { value: "FAQ", label: "FAQ", description: "Frequently asked questions" },
  { value: "BreadcrumbList", label: "BreadcrumbList", description: "Site navigation breadcrumbs" },
  { value: "LocalBusiness", label: "LocalBusiness", description: "Physical business location" },
];

const AVAILABILITY_OPTIONS = [
  { value: "https://schema.org/InStock", label: "In Stock" },
  { value: "https://schema.org/OutOfStock", label: "Out of Stock" },
  { value: "https://schema.org/PreOrder", label: "Pre-Order" },
  { value: "https://schema.org/Discontinued", label: "Discontinued" },
];

const DEFAULT_FORM: FormData = {
  headline: "",
  author: "",
  datePublished: "",
  dateModified: "",
  image: "",
  publisherName: "",
  publisherLogo: "",
  articleBody: "",
  productName: "",
  productDescription: "",
  price: "",
  currency: "USD",
  availability: "https://schema.org/InStock",
  brand: "",
  sku: "",
  ratingValue: "",
  reviewCount: "",
  faqItems: [{ question: "", answer: "" }],
  breadcrumbs: [
    { name: "Home", url: "https://example.com" },
    { name: "Category", url: "https://example.com/category" },
  ],
  businessName: "",
  businessType: "LocalBusiness",
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  addressCountry: "US",
  telephone: "",
  businessUrl: "",
  openingHours: "Mo-Fr 09:00-17:00",
};

function buildJsonLd(type: SchemaType, form: FormData): Record<string, unknown> {
  const base = { "@context": "https://schema.org", "@type": type };

  switch (type) {
    case "Article": {
      const obj: Record<string, unknown> = {
        ...base,
        ...(form.headline && { headline: form.headline }),
        ...(form.author && {
          author: { "@type": "Person", name: form.author },
        }),
        ...(form.datePublished && { datePublished: form.datePublished }),
        ...(form.dateModified && { dateModified: form.dateModified }),
        ...(form.image && { image: form.image }),
        ...(form.articleBody && { articleBody: form.articleBody }),
      };
      if (form.publisherName) {
        obj.publisher = {
          "@type": "Organization",
          name: form.publisherName,
          ...(form.publisherLogo && {
            logo: { "@type": "ImageObject", url: form.publisherLogo },
          }),
        };
      }
      return obj;
    }

    case "Product": {
      const obj: Record<string, unknown> = {
        ...base,
        ...(form.productName && { name: form.productName }),
        ...(form.productDescription && { description: form.productDescription }),
        ...(form.brand && { brand: { "@type": "Brand", name: form.brand } }),
        ...(form.sku && { sku: form.sku }),
        ...(form.image && { image: form.image }),
      };
      if (form.price || form.currency) {
        obj.offers = {
          "@type": "Offer",
          ...(form.price && { price: form.price }),
          priceCurrency: form.currency || "USD",
          availability: form.availability,
        };
      }
      if (form.ratingValue || form.reviewCount) {
        obj.aggregateRating = {
          "@type": "AggregateRating",
          ...(form.ratingValue && { ratingValue: form.ratingValue }),
          ...(form.reviewCount && { reviewCount: form.reviewCount }),
        };
      }
      return obj;
    }

    case "FAQ": {
      const filled = form.faqItems.filter((i) => i.question || i.answer);
      return {
        ...base,
        mainEntity: filled.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };
    }

    case "BreadcrumbList": {
      return {
        ...base,
        itemListElement: form.breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      };
    }

    case "LocalBusiness": {
      return {
        ...base,
        "@type": form.businessType || "LocalBusiness",
        ...(form.businessName && { name: form.businessName }),
        ...(form.telephone && { telephone: form.telephone }),
        ...(form.businessUrl && { url: form.businessUrl }),
        ...(form.openingHours && { openingHours: form.openingHours }),
        address: {
          "@type": "PostalAddress",
          ...(form.streetAddress && { streetAddress: form.streetAddress }),
          ...(form.addressLocality && { addressLocality: form.addressLocality }),
          ...(form.addressRegion && { addressRegion: form.addressRegion }),
          ...(form.postalCode && { postalCode: form.postalCode }),
          ...(form.addressCountry && { addressCountry: form.addressCountry }),
        },
      };
    }
  }
}

function getWarnings(type: SchemaType, form: FormData): string[] {
  const warns: string[] = [];

  if (type === "Article") {
    if (!form.headline) warns.push("headline is required for Article");
    if (!form.author) warns.push("author is recommended for Article");
    if (!form.datePublished) warns.push("datePublished is required for Article");
    if (!form.publisherName) warns.push("publisher is recommended for Google News eligibility");
    if (form.image && !form.image.startsWith("http"))
      warns.push("image should be an absolute URL");
  }

  if (type === "Product") {
    if (!form.productName) warns.push("name is required for Product");
    if (!form.price) warns.push("price is required in offers for rich results");
    if (form.ratingValue && (parseFloat(form.ratingValue) < 1 || parseFloat(form.ratingValue) > 5))
      warns.push("ratingValue should be between 1 and 5");
  }

  if (type === "FAQ") {
    const empty = form.faqItems.filter((i) => !i.question || !i.answer);
    if (empty.length > 0) warns.push(`${empty.length} FAQ item(s) missing question or answer`);
    if (form.faqItems.length === 0) warns.push("at least one FAQ item is required");
  }

  if (type === "BreadcrumbList") {
    const badUrls = form.breadcrumbs.filter((b) => b.url && !b.url.startsWith("http"));
    if (badUrls.length > 0) warns.push("breadcrumb URLs should be absolute (start with https://)");
    if (form.breadcrumbs.length < 2) warns.push("BreadcrumbList should have at least 2 items");
  }

  if (type === "LocalBusiness") {
    if (!form.businessName) warns.push("name is required for LocalBusiness");
    if (!form.streetAddress) warns.push("streetAddress is recommended");
  }

  return warns;
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "text-blue-600"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-purple-700 font-medium"; // key
          } else {
            cls = "text-green-700"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-orange-600";
        } else if (/null/.test(match)) {
          cls = "text-gray-400";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function StructuredDataBuilder() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Article");
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [copied, setCopied] = useState(false);

  const set = useCallback((key: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const jsonLd = buildJsonLd(schemaType, form);
  const jsonStr = JSON.stringify(jsonLd, null, 2);
  const scriptTag = `<script type="application/ld+json">\n${jsonStr}\n</script>`;
  const warnings = getWarnings(schemaType, form);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const updateFaqItem = (idx: number, field: keyof FAQItem, value: string) => {
    const items = [...form.faqItems];
    items[idx] = { ...items[idx], [field]: value };
    set("faqItems", items);
  };

  const addFaqItem = () => {
    set("faqItems", [...form.faqItems, { question: "", answer: "" }]);
  };

  const removeFaqItem = (idx: number) => {
    if (form.faqItems.length <= 1) return;
    set("faqItems", form.faqItems.filter((_, i) => i !== idx));
  };

  const updateBreadcrumb = (idx: number, field: keyof BreadcrumbItem, value: string) => {
    const items = [...form.breadcrumbs];
    items[idx] = { ...items[idx], [field]: value };
    set("breadcrumbs", items);
  };

  const addBreadcrumb = () => {
    set("breadcrumbs", [...form.breadcrumbs, { name: "", url: "" }]);
  };

  const removeBreadcrumb = (idx: number) => {
    if (form.breadcrumbs.length <= 1) return;
    set("breadcrumbs", form.breadcrumbs.filter((_, i) => i !== idx));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className="space-y-6">
        {/* Schema type selector */}
        <div>
          <p className={labelCls}>Schema Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCHEMA_TYPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSchemaType(s.value)}
                className={`text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                  schemaType === s.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <span
                  className={`block text-sm font-semibold ${
                    schemaType === s.value ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {s.label}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">{s.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fields per type */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          {schemaType === "Article" && (
            <>
              <div>
                <label className={labelCls}>Headline *</label>
                <input
                  className={inputCls}
                  placeholder="How to Build JSON-LD Structured Data"
                  value={form.headline}
                  onChange={(e) => set("headline", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Author</label>
                  <input
                    className={inputCls}
                    placeholder="Jane Smith"
                    value={form.author}
                    onChange={(e) => set("author", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Publisher Name</label>
                  <input
                    className={inputCls}
                    placeholder="My Blog"
                    value={form.publisherName}
                    onChange={(e) => set("publisherName", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Date Published *</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.datePublished}
                    onChange={(e) => set("datePublished", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Date Modified</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.dateModified}
                    onChange={(e) => set("dateModified", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input
                  className={inputCls}
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={(e) => set("image", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Publisher Logo URL</label>
                <input
                  className={inputCls}
                  placeholder="https://example.com/logo.png"
                  value={form.publisherLogo}
                  onChange={(e) => set("publisherLogo", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Article Body (optional)</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder="Article content summary..."
                  value={form.articleBody}
                  onChange={(e) => set("articleBody", e.target.value)}
                />
              </div>
            </>
          )}

          {schemaType === "Product" && (
            <>
              <div>
                <label className={labelCls}>Product Name *</label>
                <input
                  className={inputCls}
                  placeholder="Wireless Noise-Cancelling Headphones"
                  value={form.productName}
                  onChange={(e) => set("productName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  placeholder="Premium over-ear headphones with 30h battery..."
                  value={form.productDescription}
                  onChange={(e) => set("productDescription", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Price *</label>
                  <input
                    className={inputCls}
                    placeholder="99.99"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <input
                    className={inputCls}
                    placeholder="USD"
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>SKU</label>
                  <input
                    className={inputCls}
                    placeholder="WH-1000XM5"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Brand</label>
                  <input
                    className={inputCls}
                    placeholder="Sony"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Availability</label>
                  <select
                    className={inputCls}
                    value={form.availability}
                    onChange={(e) => set("availability", e.target.value)}
                  >
                    {AVAILABILITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input
                  className={inputCls}
                  placeholder="https://example.com/product.jpg"
                  value={form.image}
                  onChange={(e) => set("image", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Rating (1-5)</label>
                  <input
                    className={inputCls}
                    placeholder="4.5"
                    value={form.ratingValue}
                    onChange={(e) => set("ratingValue", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Review Count</label>
                  <input
                    className={inputCls}
                    placeholder="128"
                    value={form.reviewCount}
                    onChange={(e) => set("reviewCount", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {schemaType === "FAQ" && (
            <>
              <p className="text-sm text-gray-600">
                Add question/answer pairs. Each will render as a FAQ rich result in Google.
              </p>
              {form.faqItems.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                    <button
                      onClick={() => removeFaqItem(idx)}
                      disabled={form.faqItems.length <= 1}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-30"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Question"
                    value={item.question}
                    onChange={(e) => updateFaqItem(idx, "question", e.target.value)}
                  />
                  <textarea
                    className={inputCls}
                    rows={2}
                    placeholder="Answer"
                    value={item.answer}
                    onChange={(e) => updateFaqItem(idx, "answer", e.target.value)}
                  />
                </div>
              ))}
              <button
                onClick={addFaqItem}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Question
              </button>
            </>
          )}

          {schemaType === "BreadcrumbList" && (
            <>
              <p className="text-sm text-gray-600">
                Define the navigation path. Position is assigned automatically.
              </p>
              {form.breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-shrink-0 w-6 h-8 flex items-center justify-center text-xs font-bold text-gray-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      className={inputCls}
                      placeholder="Name"
                      value={crumb.name}
                      onChange={(e) => updateBreadcrumb(idx, "name", e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="https://example.com/page"
                      value={crumb.url}
                      onChange={(e) => updateBreadcrumb(idx, "url", e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => removeBreadcrumb(idx)}
                    disabled={form.breadcrumbs.length <= 1}
                    className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 disabled:opacity-30 mt-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={addBreadcrumb}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Breadcrumb
              </button>
            </>
          )}

          {schemaType === "LocalBusiness" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Business Name *</label>
                  <input
                    className={inputCls}
                    placeholder="Acme Coffee Shop"
                    value={form.businessName}
                    onChange={(e) => set("businessName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Business Type</label>
                  <input
                    className={inputCls}
                    placeholder="CafeOrCoffeeShop"
                    value={form.businessType}
                    onChange={(e) => set("businessType", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Street Address</label>
                <input
                  className={inputCls}
                  placeholder="123 Main St"
                  value={form.streetAddress}
                  onChange={(e) => set("streetAddress", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    className={inputCls}
                    placeholder="San Francisco"
                    value={form.addressLocality}
                    onChange={(e) => set("addressLocality", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input
                    className={inputCls}
                    placeholder="CA"
                    value={form.addressRegion}
                    onChange={(e) => set("addressRegion", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>ZIP</label>
                  <input
                    className={inputCls}
                    placeholder="94105"
                    value={form.postalCode}
                    onChange={(e) => set("postalCode", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Country</label>
                  <input
                    className={inputCls}
                    placeholder="US"
                    value={form.addressCountry}
                    onChange={(e) => set("addressCountry", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={inputCls}
                    placeholder="+1-415-555-1234"
                    value={form.telephone}
                    onChange={(e) => set("telephone", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Website URL</label>
                <input
                  className={inputCls}
                  placeholder="https://example.com"
                  value={form.businessUrl}
                  onChange={(e) => set("businessUrl", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Opening Hours</label>
                <input
                  className={inputCls}
                  placeholder="Mo-Fr 09:00-17:00"
                  value={form.openingHours}
                  onChange={(e) => set("openingHours", e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Format: Mo-Fr 09:00-17:00, Sa 10:00-15:00
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">Validation Warnings</p>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="flex-shrink-0 mt-0.5">⚠</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-sm text-green-700 font-medium">No warnings — looks good!</p>
          </div>
        )}

        {/* JSON-LD preview */}
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
            <span className="text-xs font-mono text-gray-400">
              application/ld+json — {schemaType}
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {copied ? "Copied!" : "Copy Script Tag"}
            </button>
          </div>

          {/* Script tag wrapper */}
          <div className="px-4 pt-3 pb-1">
            <pre className="text-xs font-mono text-gray-400 leading-relaxed">
              {`<script type="application/ld+json">`}
            </pre>
          </div>

          {/* Highlighted JSON */}
          <div className="px-4 pb-1 overflow-x-auto">
            <pre
              className="text-xs font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonStr) }}
            />
          </div>

          <div className="px-4 pt-1 pb-3">
            <pre className="text-xs font-mono text-gray-400">{`</script>`}</pre>
          </div>
        </div>

        {/* Helper tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">How to use</p>
          <p className="text-xs leading-relaxed">
            Paste the copied script tag inside the{" "}
            <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code> section of your HTML
            page. Use{" "}
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              Google Rich Results Test
            </a>{" "}
            to validate before deploying.
          </p>
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Structured Data Builder",
  "description": "Visual builder for JSON-LD structured data (Schema.org)",
  "url": "https://tools.loresync.dev/structured-data-builder",
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
