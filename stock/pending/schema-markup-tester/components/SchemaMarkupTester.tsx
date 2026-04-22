"use client";

import { useState, useCallback, useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Severity = "error" | "warning" | "info";

interface ValidationResult {
  severity: Severity;
  message: string;
}

interface PropertyDef {
  name: string;
  type: "string" | "url" | "number" | "array" | "object" | "date" | "boolean";
  description: string;
}

interface SchemaSpec {
  required: PropertyDef[];
  recommended: PropertyDef[];
}

// ── Schema Specifications ────────────────────────────────────────────────────

const SCHEMA_SPECS: Record<string, SchemaSpec> = {
  Article: {
    required: [
      { name: "headline", type: "string", description: "Title of the article" },
      { name: "author", type: "object", description: "Author of the article" },
      { name: "datePublished", type: "date", description: "Date the article was published" },
    ],
    recommended: [
      { name: "image", type: "url", description: "Representative image of the article" },
      { name: "dateModified", type: "date", description: "Date the article was last modified" },
      { name: "publisher", type: "object", description: "Publisher of the article" },
      { name: "description", type: "string", description: "Short description of the article" },
      { name: "url", type: "url", description: "Canonical URL of the article" },
    ],
  },
  Product: {
    required: [
      { name: "name", type: "string", description: "Name of the product" },
    ],
    recommended: [
      { name: "image", type: "url", description: "Image of the product" },
      { name: "description", type: "string", description: "Description of the product" },
      { name: "sku", type: "string", description: "Stock-keeping unit identifier" },
      { name: "brand", type: "object", description: "Brand of the product" },
      { name: "offers", type: "object", description: "Pricing and availability" },
      { name: "aggregateRating", type: "object", description: "Overall rating from reviews" },
    ],
  },
  FAQPage: {
    required: [
      { name: "mainEntity", type: "array", description: "Array of Question objects" },
    ],
    recommended: [],
  },
  LocalBusiness: {
    required: [
      { name: "name", type: "string", description: "Name of the business" },
      { name: "address", type: "object", description: "Physical address" },
    ],
    recommended: [
      { name: "telephone", type: "string", description: "Phone number" },
      { name: "url", type: "url", description: "Website URL" },
      { name: "image", type: "url", description: "Image of the business" },
      { name: "openingHours", type: "string", description: "Opening hours specification" },
      { name: "priceRange", type: "string", description: "Price range (e.g. $$)" },
      { name: "geo", type: "object", description: "Geographic coordinates" },
      { name: "aggregateRating", type: "object", description: "Overall rating" },
    ],
  },
  BreadcrumbList: {
    required: [
      { name: "itemListElement", type: "array", description: "Array of ListItem objects" },
    ],
    recommended: [],
  },
  Event: {
    required: [
      { name: "name", type: "string", description: "Name of the event" },
      { name: "startDate", type: "date", description: "Start date and time" },
      { name: "location", type: "object", description: "Location of the event" },
    ],
    recommended: [
      { name: "endDate", type: "date", description: "End date and time" },
      { name: "description", type: "string", description: "Description of the event" },
      { name: "image", type: "url", description: "Image of the event" },
      { name: "url", type: "url", description: "URL of the event page" },
      { name: "offers", type: "object", description: "Ticket/registration offers" },
      { name: "organizer", type: "object", description: "Organizer of the event" },
      { name: "eventStatus", type: "string", description: "Status (e.g. EventScheduled)" },
      { name: "eventAttendanceMode", type: "string", description: "Online, offline, or mixed" },
    ],
  },
  Recipe: {
    required: [
      { name: "name", type: "string", description: "Name of the recipe" },
      { name: "image", type: "url", description: "Image of the finished dish" },
      { name: "author", type: "object", description: "Author of the recipe" },
    ],
    recommended: [
      { name: "description", type: "string", description: "Short description of the recipe" },
      { name: "prepTime", type: "string", description: "Time to prepare (ISO 8601 duration)" },
      { name: "cookTime", type: "string", description: "Time to cook (ISO 8601 duration)" },
      { name: "totalTime", type: "string", description: "Total time (ISO 8601 duration)" },
      { name: "recipeIngredient", type: "array", description: "List of ingredients" },
      { name: "recipeInstructions", type: "array", description: "Step-by-step instructions" },
      { name: "recipeYield", type: "string", description: "Quantity or servings produced" },
      { name: "recipeCategory", type: "string", description: "Category (e.g. Dessert)" },
      { name: "recipeCuisine", type: "string", description: "Cuisine type (e.g. Italian)" },
      { name: "nutrition", type: "object", description: "Nutrition information" },
    ],
  },
  HowTo: {
    required: [
      { name: "name", type: "string", description: "Title of the how-to guide" },
      { name: "step", type: "array", description: "Array of HowToStep objects" },
    ],
    recommended: [
      { name: "description", type: "string", description: "Short description" },
      { name: "image", type: "url", description: "Representative image" },
      { name: "totalTime", type: "string", description: "Total time (ISO 8601 duration)" },
      { name: "supply", type: "array", description: "Supplies needed" },
      { name: "tool", type: "array", description: "Tools needed" },
    ],
  },
};

const KNOWN_TYPES = Object.keys(SCHEMA_SPECS);

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripScriptTags(input: string): string {
  const trimmed = input.trim();
  // Strip <script type="application/ld+json">...</script>
  const match = trimmed.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (match) return match[1].trim();
  return trimmed;
}

function parseSchema(raw: string): { data: Record<string, unknown> | null; error: string | null } {
  const cleaned = stripScriptTags(raw);
  if (!cleaned) return { data: null, error: null };
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
      return { data: null, error: "JSON-LD must be a JSON object, not an array or primitive." };
    }
    return { data: parsed as Record<string, unknown>, error: null };
  } catch (e) {
    return { data: null, error: `Invalid JSON: ${(e as Error).message}` };
  }
}

function detectType(data: Record<string, unknown>): string | null {
  const t = data["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t) && t.length > 0 && typeof t[0] === "string") return t[0];
  return null;
}

function hasValue(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === "string" && val.trim() === "") return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

function validateProperty(name: string, def: PropertyDef, data: Record<string, unknown>): ValidationResult | null {
  const val = data[name];
  if (!hasValue(val)) return null; // not present — handled by caller

  // Type checks
  if (def.type === "url" && typeof val === "string" && !/^https?:\/\//i.test(val)) {
    return {
      severity: "warning",
      message: `"${name}" should be an absolute URL (found: "${val.slice(0, 60)}${val.length > 60 ? "…" : ""}").`,
    };
  }
  if (def.type === "array" && !Array.isArray(val)) {
    return {
      severity: "warning",
      message: `"${name}" should be an array but got ${typeof val}.`,
    };
  }
  if (def.type === "number" && typeof val !== "number") {
    return {
      severity: "warning",
      message: `"${name}" should be a number but got ${typeof val}.`,
    };
  }
  if (def.type === "date" && typeof val === "string") {
    const iso = /^\d{4}-\d{2}-\d{2}/.test(val);
    if (!iso) {
      return {
        severity: "warning",
        message: `"${name}" should be an ISO 8601 date (e.g. "2024-01-15" or "2024-01-15T09:00:00Z") but found: "${val}".`,
      };
    }
  }
  return null;
}

function validate(data: Record<string, unknown>, schemaType: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  const spec = SCHEMA_SPECS[schemaType];
  if (!spec) return results;

  // Check @context
  if (!data["@context"]) {
    results.push({
      severity: "warning",
      message: '"@context" is missing. Add "@context": "https://schema.org".',
    });
  } else if (typeof data["@context"] === "string" && !data["@context"].includes("schema.org")) {
    results.push({
      severity: "warning",
      message: `"@context" should be "https://schema.org" (found: "${data["@context"]}").`,
    });
  }

  // Required properties
  for (const def of spec.required) {
    if (!hasValue(data[def.name])) {
      results.push({
        severity: "error",
        message: `Missing required property "${def.name}": ${def.description}.`,
      });
    } else {
      const typeIssue = validateProperty(def.name, def, data);
      if (typeIssue) results.push(typeIssue);
    }
  }

  // Recommended properties
  for (const def of spec.recommended) {
    if (!hasValue(data[def.name])) {
      results.push({
        severity: "warning",
        message: `Missing recommended property "${def.name}": ${def.description}.`,
      });
    } else {
      const typeIssue = validateProperty(def.name, def, data);
      if (typeIssue) results.push(typeIssue);
    }
  }

  // FAQPage specific: check mainEntity items
  if (schemaType === "FAQPage" && Array.isArray(data["mainEntity"])) {
    const items = data["mainEntity"] as unknown[];
    items.forEach((item, i) => {
      if (typeof item !== "object" || item === null) return;
      const q = item as Record<string, unknown>;
      if (!hasValue(q["name"])) {
        results.push({ severity: "error", message: `mainEntity[${i}] is missing "name" (the question text).` });
      }
      if (!hasValue(q["acceptedAnswer"])) {
        results.push({ severity: "error", message: `mainEntity[${i}] is missing "acceptedAnswer".` });
      } else {
        const ans = q["acceptedAnswer"] as Record<string, unknown>;
        if (typeof ans === "object" && !hasValue(ans["text"])) {
          results.push({ severity: "warning", message: `mainEntity[${i}].acceptedAnswer is missing "text".` });
        }
      }
    });
  }

  // BreadcrumbList specific
  if (schemaType === "BreadcrumbList" && Array.isArray(data["itemListElement"])) {
    const items = data["itemListElement"] as unknown[];
    items.forEach((item, i) => {
      if (typeof item !== "object" || item === null) return;
      const el = item as Record<string, unknown>;
      if (!hasValue(el["position"])) {
        results.push({ severity: "error", message: `itemListElement[${i}] is missing "position".` });
      }
      if (!hasValue(el["name"])) {
        results.push({ severity: "warning", message: `itemListElement[${i}] is missing "name".` });
      }
      if (!hasValue(el["item"])) {
        results.push({ severity: "warning", message: `itemListElement[${i}] is missing "item" (the URL).` });
      }
    });
  }

  if (results.filter((r) => r.severity !== "info").length === 0) {
    results.push({ severity: "info", message: "All required and recommended properties are present." });
  }

  return results;
}

function getFoundProperties(data: Record<string, unknown>): string[] {
  return Object.keys(data).filter((k) => hasValue(data[k]));
}

// ── Rich Result Preview ──────────────────────────────────────────────────────

function RichResultPreview({ data, schemaType }: { data: Record<string, unknown>; schemaType: string }) {
  const str = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null) {
      const o = val as Record<string, unknown>;
      return (typeof o.name === "string" ? o.name : "") || "";
    }
    return String(val ?? "");
  };

  const url = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null) {
      const o = val as Record<string, unknown>;
      return typeof o.url === "string" ? o.url : "";
    }
    return "";
  };

  if (schemaType === "Article") {
    const headline = str(data.headline) || "Article Title";
    const publisher = str(data.publisher) || "Publisher";
    const datePublished = str(data.datePublished) || "";
    const imgUrl = url(data.image) || str(data.image);
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-1 truncate">{publisher} › Article</p>
        <h3 className="text-lg text-blue-700 font-medium leading-snug mb-1 hover:underline cursor-pointer line-clamp-2">
          {headline}
        </h3>
        {str(data.description) && (
          <p className="text-sm text-gray-600 line-clamp-2">{str(data.description)}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {imgUrl && (
            <div className="w-16 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="text-xs text-gray-400">img</span>
            </div>
          )}
          {datePublished && <span className="text-xs text-gray-500">{datePublished}</span>}
        </div>
      </div>
    );
  }

  if (schemaType === "Product") {
    const name = str(data.name) || "Product Name";
    const rating = data.aggregateRating as Record<string, unknown> | undefined;
    const ratingVal = rating ? str(rating.ratingValue) : "";
    const reviewCount = rating ? str(rating.reviewCount || rating.ratingCount) : "";
    const offers = data.offers as Record<string, unknown> | undefined;
    const price = offers ? str(offers.price) : "";
    const currency = offers ? (str(offers.priceCurrency) || "$") : "$";
    const availability = offers ? str(offers.availability) : "";
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-1">example.com › products</p>
        <h3 className="text-lg text-blue-700 font-medium mb-1 hover:underline cursor-pointer">
          {name}
        </h3>
        {str(data.description) && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{str(data.description)}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          {ratingVal && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-sm">{"★".repeat(Math.round(parseFloat(ratingVal))).slice(0, 5)}</span>
              <span className="text-sm text-gray-700 font-medium">{ratingVal}</span>
              {reviewCount && <span className="text-xs text-gray-500">({reviewCount} reviews)</span>}
            </div>
          )}
          {price && (
            <span className="text-sm font-semibold text-gray-900">
              {currency}{price}
            </span>
          )}
          {availability && (
            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              {availability.replace("https://schema.org/", "")}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (schemaType === "FAQPage") {
    const items = (data.mainEntity as unknown[] | undefined) || [];
    const faqs = items.slice(0, 3) as Record<string, unknown>[];
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-2">example.com</p>
        <h3 className="text-base text-blue-700 font-medium mb-3 hover:underline cursor-pointer">
          FAQ — Frequently Asked Questions
        </h3>
        <div className="space-y-2">
          {faqs.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No FAQ items found in mainEntity</p>
          ) : (
            faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 font-medium">{str(faq.name) || "Question"}</span>
                  <span className="text-gray-400 text-sm ml-2">+</span>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 3 && (
          <p className="text-xs text-gray-400 mt-2">+{items.length - 3} more questions</p>
        )}
      </div>
    );
  }

  if (schemaType === "LocalBusiness") {
    const name = str(data.name) || "Business Name";
    const address = data.address as Record<string, unknown> | undefined;
    const addrStr = address
      ? [str(address.streetAddress), str(address.addressLocality), str(address.addressRegion)].filter(Boolean).join(", ")
      : "";
    const rating = data.aggregateRating as Record<string, unknown> | undefined;
    const ratingVal = rating ? str(rating.ratingValue) : "";
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-1">Maps · Local</p>
        <h3 className="text-lg text-blue-700 font-medium mb-1 hover:underline cursor-pointer">{name}</h3>
        {ratingVal && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-medium text-gray-800">{ratingVal}</span>
            <span className="text-yellow-500 text-sm">{"★".repeat(Math.round(parseFloat(ratingVal))).slice(0, 5)}</span>
            {rating && str(rating.reviewCount) && (
              <span className="text-xs text-gray-500">({str(rating.reviewCount)} reviews)</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
          {str(data.priceRange) && <span className="font-medium">{str(data.priceRange)}</span>}
          {addrStr && <span>{addrStr}</span>}
          {str(data.telephone) && <span>{str(data.telephone)}</span>}
        </div>
        {str(data.openingHours) && (
          <p className="text-xs text-green-700 mt-1">Open now · {str(data.openingHours)}</p>
        )}
      </div>
    );
  }

  if (schemaType === "BreadcrumbList") {
    const items = (data.itemListElement as unknown[] | undefined) || [];
    const crumbs = (items as Record<string, unknown>[])
      .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
      .map((el) => str(el.name) || str(el.item) || "Page");
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-2 flex items-center gap-1 flex-wrap">
          {crumbs.length === 0
            ? "Home › Page › Subpage"
            : crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span>›</span>}
                  <span>{c}</span>
                </span>
              ))}
        </p>
        <h3 className="text-lg text-blue-700 font-medium hover:underline cursor-pointer">
          {crumbs[crumbs.length - 1] || "Page Title"}
        </h3>
        <p className="text-sm text-gray-600 mt-1">Page description would appear here.</p>
      </div>
    );
  }

  if (schemaType === "Event") {
    const name = str(data.name) || "Event Name";
    const startDate = str(data.startDate) || "";
    const location = data.location as Record<string, unknown> | undefined;
    const locationName = location ? str(location.name) : "";
    const offers = data.offers as Record<string, unknown> | undefined;
    const price = offers ? str(offers.price) : "";
    const currency = offers ? (str(offers.priceCurrency) || "$") : "$";
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-1">Events</p>
        <h3 className="text-lg text-blue-700 font-medium mb-1 hover:underline cursor-pointer">{name}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
          {startDate && <span className="font-medium">{startDate}</span>}
          {locationName && <span>{locationName}</span>}
          {price && <span className="font-semibold text-gray-900">{currency}{price}</span>}
        </div>
        {str(data.description) && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{str(data.description)}</p>
        )}
      </div>
    );
  }

  if (schemaType === "Recipe") {
    const name = str(data.name) || "Recipe Name";
    const rating = data.aggregateRating as Record<string, unknown> | undefined;
    const ratingVal = rating ? str(rating.ratingValue) : "";
    const reviewCount = rating ? str(rating.reviewCount || rating.ratingCount) : "";
    const totalTime = str(data.totalTime) || "";
    const recipeYield = str(data.recipeYield) || "";
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-1">Recipe</p>
        <h3 className="text-lg text-blue-700 font-medium mb-1 hover:underline cursor-pointer">{name}</h3>
        {str(data.description) && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{str(data.description)}</p>
        )}
        <div className="flex items-center gap-3 text-sm flex-wrap">
          {ratingVal && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">{"★".repeat(Math.round(parseFloat(ratingVal))).slice(0, 5)}</span>
              <span className="text-gray-700 font-medium">{ratingVal}</span>
              {reviewCount && <span className="text-gray-500 text-xs">({reviewCount})</span>}
            </div>
          )}
          {totalTime && (
            <span className="text-gray-600">
              <span className="font-medium">Time:</span> {totalTime}
            </span>
          )}
          {recipeYield && (
            <span className="text-gray-600">
              <span className="font-medium">Yield:</span> {recipeYield}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (schemaType === "HowTo") {
    const name = str(data.name) || "How To Guide";
    const steps = (data.step as unknown[] | undefined) || [];
    const totalTime = str(data.totalTime) || "";
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
        <p className="text-xs text-green-700 mb-1">How-To</p>
        <h3 className="text-lg text-blue-700 font-medium mb-2 hover:underline cursor-pointer">{name}</h3>
        {str(data.description) && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{str(data.description)}</p>
        )}
        <div className="space-y-1">
          {steps.slice(0, 3).map((step, i) => {
            const s = step as Record<string, unknown>;
            return (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="line-clamp-1">{str(s.text) || str(s.name) || "Step"}</span>
              </div>
            );
          })}
          {steps.length > 3 && (
            <p className="text-xs text-gray-400 pl-7">+{steps.length - 3} more steps</p>
          )}
        </div>
        {totalTime && <p className="text-xs text-gray-500 mt-2">Total time: {totalTime}</p>}
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white max-w-xl font-sans">
      <p className="text-xs text-green-700 mb-1">example.com</p>
      <h3 className="text-lg text-blue-700 font-medium mb-1 hover:underline cursor-pointer">
        {str(data.name) || str(data.headline) || schemaType}
      </h3>
      {(str(data.description) || str(data.text)) && (
        <p className="text-sm text-gray-600 line-clamp-2">{str(data.description) || str(data.text)}</p>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    error: "bg-red-100 text-red-700 border border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    info: "bg-green-50 text-green-700 border border-green-200",
  };
  const labels: Record<Severity, string> = {
    error: "Error",
    warning: "Warning",
    info: "OK",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SchemaMarkupTester() {
  const [input, setInput] = useState("");
  const [validated, setValidated] = useState(false);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    return parseSchema(input);
  }, [input]);

  const data = parsed?.data ?? null;
  const parseError = parsed?.error ?? null;
  const schemaType = data ? detectType(data) : null;
  const isKnownType = schemaType ? KNOWN_TYPES.includes(schemaType) : false;

  const results = useMemo(() => {
    if (!validated || !data || !schemaType || !isKnownType) return [];
    return validate(data, schemaType);
  }, [validated, data, schemaType, isKnownType]);

  const foundProps = useMemo(() => {
    if (!data) return [];
    return getFoundProperties(data);
  }, [data]);

  const errors = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");
  const infos = results.filter((r) => r.severity === "info");

  const formattedJson = useMemo(() => {
    if (!data) return "";
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return "";
    }
  }, [data]);

  const scriptTag = formattedJson
    ? `<script type="application/ld+json">\n${formattedJson}\n</script>`
    : "";

  const handleValidate = useCallback(() => {
    setValidated(true);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setValidated(false);
  }, []);

  const EXAMPLE_SCHEMAS: Record<string, string> = {
    Article: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Improve Your SEO in 2024",
      "author": { "@type": "Person", "name": "Jane Doe" },
      "datePublished": "2024-01-15",
      "dateModified": "2024-03-10",
      "image": "https://example.com/article.jpg",
      "publisher": { "@type": "Organization", "name": "Example Blog", "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" } },
      "description": "A comprehensive guide to improving search engine rankings.",
      "url": "https://example.com/seo-guide"
    }, null, 2),
    Product: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Wireless Noise-Cancelling Headphones",
      "image": "https://example.com/headphones.jpg",
      "description": "Premium wireless headphones with active noise cancellation.",
      "sku": "WH-1000XM5",
      "brand": { "@type": "Brand", "name": "SoundMax" },
      "offers": { "@type": "Offer", "url": "https://example.com/headphones", "priceCurrency": "USD", "price": "349.99", "availability": "https://schema.org/InStock" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "2341" }
    }, null, 2),
    FAQPage: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "What is structured data?", "acceptedAnswer": { "@type": "Answer", "text": "Structured data is a standardized format for providing information about a page and classifying the page content." } },
        { "@type": "Question", "name": "How do I add JSON-LD to my website?", "acceptedAnswer": { "@type": "Answer", "text": "Add a <script type='application/ld+json'> block to your page's <head> section with your schema markup." } }
      ]
    }, null, 2),
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            JSON-LD Markup
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Load example:</span>
            {(["Article", "Product", "FAQPage"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setInput(EXAMPLE_SCHEMAS[t]); setValidated(false); }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setValidated(false); }}
          placeholder={`Paste your JSON-LD here. Accepts raw JSON or the full <script> block.\n\nExample:\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "My Article Title"\n}`}
          spellCheck={false}
          className="w-full h-56 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
        />
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span className="font-medium flex-shrink-0">Parse Error:</span>
          <span>{parseError}</span>
        </div>
      )}

      {/* Detected type */}
      {data && !parseError && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm flex-wrap">
          <span className="text-gray-500">Detected type:</span>
          <span className="font-mono font-semibold text-gray-900">{schemaType ?? "(none)"}</span>
          {schemaType && (
            isKnownType ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                Supported
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                Unknown type — basic check only
              </span>
            )
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleValidate}
          disabled={!data || !!parseError}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Validate
        </button>
        {input && (
          <button
            onClick={handleClear}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {validated && data && (
        <div className="space-y-5">
          {/* Summary bar */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex-wrap">
            <span className="text-sm font-medium text-gray-700">Validation Summary:</span>
            <span className={`flex items-center gap-1.5 text-sm font-medium ${errors.length > 0 ? "text-red-700" : "text-gray-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${errors.length > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400"}`}>
                {errors.length}
              </span>
              Errors
            </span>
            <span className={`flex items-center gap-1.5 text-sm font-medium ${warnings.length > 0 ? "text-yellow-700" : "text-gray-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${warnings.length > 0 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"}`}>
                {warnings.length}
              </span>
              Warnings
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{foundProps.length} properties found</span>
            {errors.length === 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                Passes required checks
              </span>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-red-50 border-b border-red-200">
                <span className="text-sm font-semibold text-red-700">Errors — Required Properties Missing</span>
              </div>
              <ul className="divide-y divide-red-100">
                {errors.map((r, i) => (
                  <li key={i} className="px-4 py-3 flex items-start gap-3">
                    <SeverityBadge severity="error" />
                    <span className="text-sm text-gray-700 leading-relaxed">{r.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="border border-yellow-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
                <span className="text-sm font-semibold text-yellow-700">Warnings — Recommended Properties Missing</span>
              </div>
              <ul className="divide-y divide-yellow-100">
                {warnings.map((r, i) => (
                  <li key={i} className="px-4 py-3 flex items-start gap-3">
                    <SeverityBadge severity="warning" />
                    <span className="text-sm text-gray-700 leading-relaxed">{r.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* OK messages */}
          {infos.length > 0 && errors.length === 0 && (
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <ul className="divide-y divide-green-50">
                {infos.map((r, i) => (
                  <li key={i} className="px-4 py-3 flex items-start gap-3">
                    <SeverityBadge severity="info" />
                    <span className="text-sm text-gray-700 leading-relaxed">{r.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Found properties */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Found Properties</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {foundProps.length}
              </span>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {foundProps.map((prop) => {
                const spec = schemaType && SCHEMA_SPECS[schemaType];
                const isRequired = spec ? spec.required.some((p) => p.name === prop) : false;
                const isRecommended = spec ? spec.recommended.some((p) => p.name === prop) : false;
                return (
                  <span
                    key={prop}
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                      isRequired
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : isRecommended
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                    title={
                      isRequired ? "Required property" : isRecommended ? "Recommended property" : "Additional property"
                    }
                  >
                    {prop}
                  </span>
                );
              })}
            </div>
            <div className="px-4 pb-3 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> Required
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span> Recommended
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span> Additional
              </span>
            </div>
          </div>

          {/* Rich result preview */}
          {schemaType && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Rich Result Preview</span>
                <span className="text-xs text-gray-400 ml-2">(Simplified Google SERP preview)</span>
              </div>
              <div className="p-4 bg-white">
                <RichResultPreview data={data} schemaType={schemaType} />
              </div>
            </div>
          )}

          {/* Copy validated JSON-LD */}
          {formattedJson && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Formatted JSON-LD</span>
                <div className="flex items-center gap-2">
                  <CopyButton text={formattedJson} label="Copy JSON" />
                  <CopyButton text={scriptTag} label="Copy <script> tag" />
                </div>
              </div>
              <div className="bg-gray-900 p-4 overflow-x-auto max-h-72">
                <pre className="text-sm font-mono text-green-400 whitespace-pre">{formattedJson}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
