"use client";

import { useState, useCallback } from "react";

interface ChildItem {
  id: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  order: number;
  alignSelf: string;
}

const FLEX_DIRECTIONS = ["row", "column", "row-reverse", "column-reverse"] as const;
const JUSTIFY_OPTIONS = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"] as const;
const ALIGN_ITEMS_OPTIONS = ["stretch", "flex-start", "flex-end", "center", "baseline"] as const;
const ALIGN_SELF_OPTIONS = ["auto", "stretch", "flex-start", "flex-end", "center", "baseline"] as const;
const WRAP_OPTIONS = ["nowrap", "wrap", "wrap-reverse"] as const;

let nextId = 4;

function createChild(): ChildItem {
  return {
    id: nextId++,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    order: 0,
    alignSelf: "auto",
  };
}

export default function FlexboxGenerator() {
  const [flexDirection, setFlexDirection] = useState<string>("row");
  const [justifyContent, setJustifyContent] = useState<string>("flex-start");
  const [alignItems, setAlignItems] = useState<string>("stretch");
  const [flexWrap, setFlexWrap] = useState<string>("nowrap");
  const [gap, setGap] = useState<number>(8);
  const [children, setChildren] = useState<ChildItem[]>([
    { id: 1, flexGrow: 0, flexShrink: 1, flexBasis: "auto", order: 0, alignSelf: "auto" },
    { id: 2, flexGrow: 0, flexShrink: 1, flexBasis: "auto", order: 0, alignSelf: "auto" },
    { id: 3, flexGrow: 0, flexShrink: 1, flexBasis: "auto", order: 0, alignSelf: "auto" },
  ]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const addChild = useCallback(() => {
    if (children.length >= 10) return;
    setChildren((prev) => [...prev, createChild()]);
  }, [children.length]);

  const removeChild = useCallback(() => {
    if (children.length <= 1) return;
    setChildren((prev) => {
      const next = prev.slice(0, -1);
      if (selectedChild !== null && !next.find((c) => c.id === selectedChild)) {
        setSelectedChild(null);
      }
      return next;
    });
  }, [children.length, selectedChild]);

  const updateChild = useCallback((id: number, field: keyof ChildItem, value: string | number) => {
    setChildren((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }, []);

  const selectedItem = children.find((c) => c.id === selectedChild) ?? null;

  // Generate CSS
  const containerCSS = `.flex-container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`;

  const childrenCSS = children
    .map((child, i) => {
      const lines: string[] = [];
      if (child.flexGrow !== 0) lines.push(`  flex-grow: ${child.flexGrow};`);
      if (child.flexShrink !== 1) lines.push(`  flex-shrink: ${child.flexShrink};`);
      if (child.flexBasis !== "auto") lines.push(`  flex-basis: ${child.flexBasis};`);
      if (child.order !== 0) lines.push(`  order: ${child.order};`);
      if (child.alignSelf !== "auto") lines.push(`  align-self: ${child.alignSelf};`);
      if (lines.length === 0) return null;
      return `.flex-item-${i + 1} {\n${lines.join("\n")}\n}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const fullCSS = childrenCSS ? `${containerCSS}\n\n${childrenCSS}` : containerCSS;

  const copyCSS = async () => {
    await navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isColumn = flexDirection === "column" || flexDirection === "column-reverse";

  const COLORS = [
    "bg-blue-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400",
    "bg-violet-400", "bg-cyan-400", "bg-orange-400", "bg-pink-400",
    "bg-teal-400", "bg-indigo-400",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* Controls Panel */}
      <div className="space-y-6">
        {/* Container Controls */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Container
          </h2>

          <div className="space-y-3">
            <ControlSelect
              label="flex-direction"
              value={flexDirection}
              onChange={setFlexDirection}
              options={FLEX_DIRECTIONS}
              activeValue={flexDirection}
            />
            <ControlSelect
              label="justify-content"
              value={justifyContent}
              onChange={setJustifyContent}
              options={JUSTIFY_OPTIONS}
              activeValue={justifyContent}
            />
            <ControlSelect
              label="align-items"
              value={alignItems}
              onChange={setAlignItems}
              options={ALIGN_ITEMS_OPTIONS}
              activeValue={alignItems}
            />
            <ControlSelect
              label="flex-wrap"
              value={flexWrap}
              onChange={setFlexWrap}
              options={WRAP_OPTIONS}
              activeValue={flexWrap}
            />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                gap
                <span className="ml-1 text-gray-400 font-normal">{gap}px</span>
              </label>
              <input
                type="range"
                min={0}
                max={40}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-gray-900"
              />
            </div>
          </div>

          {/* Add/Remove children */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={removeChild}
              disabled={children.length <= 1}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              − Remove
            </button>
            <button
              onClick={addChild}
              disabled={children.length >= 10}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              + Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {children.length} / 10 items
          </p>
        </div>

        {/* Child Controls */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Child Properties
          </h2>
          {selectedItem ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Editing: Item {children.findIndex((c) => c.id === selectedItem.id) + 1}
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  flex-grow
                  <span className="ml-1 text-gray-400 font-normal">{selectedItem.flexGrow}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={selectedItem.flexGrow}
                  onChange={(e) => updateChild(selectedItem.id, "flexGrow", Number(e.target.value))}
                  className="w-full accent-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  flex-shrink
                  <span className="ml-1 text-gray-400 font-normal">{selectedItem.flexShrink}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={selectedItem.flexShrink}
                  onChange={(e) => updateChild(selectedItem.id, "flexShrink", Number(e.target.value))}
                  className="w-full accent-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  flex-basis
                </label>
                <input
                  type="text"
                  value={selectedItem.flexBasis}
                  onChange={(e) => updateChild(selectedItem.id, "flexBasis", e.target.value)}
                  placeholder="auto, 100px, 50%..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  order
                  <span className="ml-1 text-gray-400 font-normal">{selectedItem.order}</span>
                </label>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  value={selectedItem.order}
                  onChange={(e) => updateChild(selectedItem.id, "order", Number(e.target.value))}
                  className="w-full accent-gray-900"
                />
              </div>
              <ControlSelect
                label="align-self"
                value={selectedItem.alignSelf}
                onChange={(v) => updateChild(selectedItem.id, "alignSelf", v)}
                options={ALIGN_SELF_OPTIONS}
                activeValue={selectedItem.alignSelf}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">
              Click an item in the preview to edit its properties.
            </p>
          )}
        </div>
      </div>

      {/* Preview + CSS Output */}
      <div className="space-y-6">
        {/* Live Preview */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Preview
            </h2>
            <span className="text-xs text-gray-400">Click an item to select it</span>
          </div>
          <div
            className="p-4 min-h-[300px] bg-gray-50/50"
            style={{
              display: "flex",
              flexDirection: flexDirection as React.CSSProperties["flexDirection"],
              justifyContent,
              alignItems,
              flexWrap: flexWrap as React.CSSProperties["flexWrap"],
              gap: `${gap}px`,
            }}
          >
            {children.map((child, i) => (
              <div
                key={child.id}
                onClick={() => setSelectedChild(child.id === selectedChild ? null : child.id)}
                className={`${COLORS[i % COLORS.length]} rounded-md cursor-pointer text-white font-semibold text-sm flex items-center justify-center transition-all ${
                  child.id === selectedChild
                    ? "ring-2 ring-gray-900 ring-offset-2"
                    : "hover:ring-2 hover:ring-gray-400 hover:ring-offset-1"
                }`}
                style={{
                  flexGrow: child.flexGrow,
                  flexShrink: child.flexShrink,
                  flexBasis: child.flexBasis,
                  order: child.order,
                  alignSelf: child.alignSelf === "auto" ? undefined : child.alignSelf,
                  minWidth: isColumn ? undefined : "60px",
                  minHeight: isColumn ? "40px" : "60px",
                  padding: "12px 20px",
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* CSS Output */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              CSS Output
            </h2>
            <button
              onClick={copyCSS}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                copied
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {copied ? "Copied!" : "Copy CSS"}
            </button>
          </div>
          <pre className="p-4 text-sm font-mono text-gray-800 overflow-x-auto leading-relaxed whitespace-pre">
            {fullCSS}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* Reusable select control */
function ControlSelect({
  label,
  value,
  onChange,
  options,
  activeValue,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  activeValue: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              activeValue === opt
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
