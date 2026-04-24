"use client";

import { useState, useCallback, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GqlField {
  name: string;
  typeName: string;   // unwrapped base type name
  rawType: string;    // as written in schema (e.g. "[User!]!")
  isScalar: boolean;
  args: GqlArg[];
}

interface GqlArg {
  name: string;
  typeName: string;
}

interface GqlType {
  name: string;
  fields: GqlField[];
}

interface ParsedSchema {
  types: Record<string, GqlType>;
  queryType: string | null;
  mutationType: string | null;
}

// Selected field node (tree structure matching schema)
interface SelectedField {
  selected: boolean;
  args: Record<string, string>; // argName -> value string
  children: Record<string, SelectedField>;
}

// ---------------------------------------------------------------------------
// Sample schema
// ---------------------------------------------------------------------------

const SAMPLE_SCHEMA = `type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(authorId: ID, published: Boolean): [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User
  updateUser(id: ID!, name: String): User
  deleteUser(id: ID!): Boolean
  createPost(title: String!, body: String!, authorId: ID!): Post
}

type User {
  id: ID!
  name: String!
  email: String!
  createdAt: String!
  posts: [Post!]!
  profile: Profile
}

type Profile {
  bio: String
  avatarUrl: String
  website: String
}

type Post {
  id: ID!
  title: String!
  body: String!
  published: Boolean!
  author: User!
  tags: [String!]!
  createdAt: String!
}`;

// ---------------------------------------------------------------------------
// SDL Parser
// ---------------------------------------------------------------------------

const BUILT_IN_SCALARS = new Set([
  "String", "Int", "Float", "Boolean", "ID",
]);

function unwrapType(raw: string): string {
  // Strip !, [], combinations until we get the base name
  return raw.replace(/[[\]!]/g, "").trim();
}

function parseArgList(argStr: string): GqlArg[] {
  if (!argStr.trim()) return [];
  return argStr.split(",").map((a) => {
    const parts = a.trim().split(":");
    return {
      name: parts[0].trim(),
      typeName: parts.slice(1).join(":").trim(),
    };
  }).filter((a) => a.name);
}

function parseSchema(sdl: string): ParsedSchema {
  const types: Record<string, GqlType> = {};
  let queryType: string | null = null;
  let mutationType: string | null = null;

  // Strip comments
  const cleaned = sdl.replace(/#[^\n]*/g, "");

  // Match type blocks: type Foo { ... }  (also interface/input)
  const typeRe = /(?:type|input|interface)\s+(\w+)(?:\s+implements\s+[\w\s&]+)?\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;

  while ((m = typeRe.exec(cleaned)) !== null) {
    const typeName = m[1];
    const body = m[2];

    const fields: GqlField[] = [];

    // Match field lines: fieldName(args): Type
    const fieldRe = /(\w+)\s*(?:\(([^)]*)\))?\s*:\s*([\w[\]!]+)/g;
    let fm: RegExpExecArray | null;
    while ((fm = fieldRe.exec(body)) !== null) {
      const fieldName = fm[1];
      const argsPart = fm[2] ?? "";
      const rawType = fm[3];
      const baseName = unwrapType(rawType);
      fields.push({
        name: fieldName,
        typeName: baseName,
        rawType,
        isScalar: BUILT_IN_SCALARS.has(baseName),
        args: parseArgList(argsPart),
      });
    }

    types[typeName] = { name: typeName, fields };

    if (typeName === "Query") queryType = "Query";
    if (typeName === "Mutation") mutationType = "Mutation";
  }

  // schema block override
  const schemaRe = /schema\s*\{([^}]*)\}/;
  const sm = schemaRe.exec(cleaned);
  if (sm) {
    const qm = /query\s*:\s*(\w+)/.exec(sm[1]);
    const mm = /mutation\s*:\s*(\w+)/.exec(sm[1]);
    if (qm) queryType = qm[1];
    if (mm) mutationType = mm[1];
  }

  return { types, queryType, mutationType };
}

// ---------------------------------------------------------------------------
// Query generator
// ---------------------------------------------------------------------------

function buildQuery(
  rootTypeName: string,
  fieldName: string,
  selectedFields: Record<string, SelectedField>,
  types: Record<string, GqlType>,
  operationType: "query" | "mutation",
): string {
  const rootType = types[rootTypeName];
  if (!rootType) return "";

  const field = rootType.fields.find((f) => f.name === fieldName);
  if (!field) return "";

  const sel = selectedFields[fieldName];
  if (!sel || !sel.selected) return "";

  const lines: string[] = [];

  function formatArgs(argValues: Record<string, string>, fieldArgs: GqlArg[]): string {
    const parts = fieldArgs
      .map((a) => {
        const val = argValues[a.name];
        if (!val || !val.trim()) return null;
        // Wrap in quotes if the type looks like String/ID and value isn't already quoted/variable
        const needsQuotes = /^(String|ID)/.test(a.typeName) && !val.startsWith('"') && !val.startsWith("$");
        return `${a.name}: ${needsQuotes ? `"${val}"` : val}`;
      })
      .filter(Boolean);
    return parts.length ? `(${parts.join(", ")})` : "";
  }

  function renderFields(
    typeFields: GqlField[],
    selNode: Record<string, SelectedField>,
    indent: number,
  ): string[] {
    const result: string[] = [];
    const pad = "  ".repeat(indent);

    for (const f of typeFields) {
      const node = selNode[f.name];
      if (!node || !node.selected) continue;

      const argsStr = formatArgs(node.args, f.args);

      if (f.isScalar) {
        result.push(`${pad}${f.name}${argsStr}`);
      } else {
        const childType = types[f.typeName];
        if (!childType) {
          result.push(`${pad}${f.name}${argsStr}`);
          continue;
        }
        const childLines = renderFields(childType.fields, node.children, indent + 1);
        if (childLines.length === 0) {
          // No children selected — still emit field with a placeholder
          result.push(`${pad}${f.name}${argsStr} {`);
          result.push(`${"  ".repeat(indent + 1)}# select fields`);
          result.push(`${pad}}`);
        } else {
          result.push(`${pad}${f.name}${argsStr} {`);
          result.push(...childLines);
          result.push(`${pad}}`);
        }
      }
    }

    return result;
  }

  const argsStr = formatArgs(sel.args, field.args);

  if (field.isScalar) {
    lines.push(`${operationType} {`);
    lines.push(`  ${fieldName}${argsStr}`);
    lines.push(`}`);
  } else {
    const childType = types[field.typeName];
    const childLines = childType
      ? renderFields(childType.fields, sel.children, 2)
      : [];

    lines.push(`${operationType} {`);
    lines.push(`  ${fieldName}${argsStr} {`);
    if (childLines.length > 0) {
      lines.push(...childLines);
    } else {
      lines.push(`    # select fields`);
    }
    lines.push(`  }`);
    lines.push(`}`);
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Syntax highlighting
// ---------------------------------------------------------------------------

function highlightGql(code: string): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    // strings
    .replace(/"([^"]*)"/g, `<span class="hl-string">"$1"</span>`)
    // keywords
    .replace(
      /\b(query|mutation|subscription|fragment|on|true|false|null)\b/g,
      `<span class="hl-keyword">$1</span>`,
    )
    // type names (capitalised words not at start of keyword spans)
    .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, `<span class="hl-type">$1</span>`)
    // comments
    .replace(/(#[^\n]*)/g, `<span class="hl-comment">$1</span>`);
}

// ---------------------------------------------------------------------------
// Field tree component
// ---------------------------------------------------------------------------

interface FieldNodeProps {
  field: GqlField;
  path: string[];
  types: Record<string, GqlType>;
  selNode: SelectedField | undefined;
  onChange: (path: string[], patch: Partial<SelectedField>) => void;
  depth: number;
}

function FieldNode({ field, path, types, selNode, onChange, depth }: FieldNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const [showArgs, setShowArgs] = useState(false);

  const isSelected = selNode?.selected ?? false;
  const childType = !field.isScalar ? types[field.typeName] : null;

  const handleCheck = () => {
    onChange(path, { selected: !isSelected });
  };

  const handleArgChange = (argName: string, value: string) => {
    const newArgs = { ...(selNode?.args ?? {}), [argName]: value };
    onChange(path, { args: newArgs });
  };

  return (
    <div className={`${depth > 0 ? "ml-4 border-l border-gray-100 pl-3" : ""}`}>
      <div className="flex items-center gap-1.5 py-1 group">
        {/* Expand toggle for object types */}
        {childType ? (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
          >
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
            >
              <path d="M6 4l4 4-4 4V4z" />
            </svg>
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheck}
          className="w-3.5 h-3.5 rounded accent-violet-600 cursor-pointer flex-shrink-0"
        />

        {/* Field name */}
        <span
          className={`text-sm font-mono cursor-pointer select-none ${isSelected ? "text-gray-900 font-medium" : "text-gray-500"}`}
          onClick={handleCheck}
        >
          {field.name}
        </span>

        {/* Type badge */}
        <span className="text-xs text-gray-400 font-mono hidden sm:inline">
          {field.rawType}
        </span>

        {/* Args button */}
        {field.args.length > 0 && (
          <button
            onClick={() => setShowArgs((s) => !s)}
            title="Edit arguments"
            className={`ml-1 px-1.5 py-0.5 text-xs rounded transition-colors cursor-pointer ${
              showArgs
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100"
            }`}
          >
            args({field.args.length})
          </button>
        )}
      </div>

      {/* Args form */}
      {showArgs && field.args.length > 0 && (
        <div className="ml-9 mb-2 p-2.5 bg-violet-50 rounded-lg border border-violet-100 space-y-1.5">
          {field.args.map((arg) => (
            <div key={arg.name} className="flex items-center gap-2">
              <span className="text-xs font-mono text-violet-700 w-28 flex-shrink-0 truncate">
                {arg.name}
                <span className="text-violet-400 ml-1">{arg.typeName}</span>
              </span>
              <input
                type="text"
                value={selNode?.args[arg.name] ?? ""}
                onChange={(e) => handleArgChange(arg.name, e.target.value)}
                placeholder="value"
                className="flex-1 px-2 py-0.5 text-xs font-mono border border-violet-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
              />
            </div>
          ))}
        </div>
      )}

      {/* Children */}
      {childType && expanded && (
        <div>
          {childType.fields.map((child) => (
            <FieldNode
              key={child.name}
              field={child}
              path={[...path, "children", child.name]}
              types={types}
              selNode={selNode?.children[child.name]}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers for immutable tree updates
// ---------------------------------------------------------------------------

function setAtPath(
  root: Record<string, SelectedField>,
  path: string[],
  patch: Partial<SelectedField>,
): Record<string, SelectedField> {
  if (path.length === 0) return root;

  const [head, ...rest] = path;

  const existing: SelectedField = root[head] ?? {
    selected: false,
    args: {},
    children: {},
  };

  if (rest.length === 0) {
    return { ...root, [head]: { ...existing, ...patch } };
  }

  // Navigate into "children" segment
  if (rest[0] === "children") {
    const childrenPath = rest.slice(1);
    const newChildren = setAtPath(existing.children, childrenPath, patch);
    return { ...root, [head]: { ...existing, children: newChildren } };
  }

  return root;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GraphqlBuilder() {
  const [schema, setSchema] = useState(SAMPLE_SCHEMA);
  const [operationType, setOperationType] = useState<"query" | "mutation">("query");
  const [activeRootField, setActiveRootField] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, SelectedField>>({});
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      return parseSchema(schema);
    } catch {
      return { types: {}, queryType: null, mutationType: null };
    }
  }, [schema]);

  const rootTypeName =
    operationType === "query" ? parsed.queryType : parsed.mutationType;
  const rootType = rootTypeName ? parsed.types[rootTypeName] : null;
  const rootFields = rootType?.fields ?? [];

  // Auto-select first root field when type changes
  const firstFieldName = rootFields[0]?.name ?? null;
  const resolvedActiveField = activeRootField && rootFields.some((f) => f.name === activeRootField)
    ? activeRootField
    : firstFieldName;

  const activeField = resolvedActiveField
    ? rootType?.fields.find((f) => f.name === resolvedActiveField) ?? null
    : null;

  const handleSelectionChange = useCallback(
    (path: string[], patch: Partial<SelectedField>) => {
      setSelections((prev) => setAtPath(prev, path, patch));
    },
    [],
  );

  const generatedQuery = useMemo(() => {
    if (!rootTypeName || !resolvedActiveField) return "";
    return buildQuery(
      rootTypeName,
      resolvedActiveField,
      selections,
      parsed.types,
      operationType,
    );
  }, [rootTypeName, resolvedActiveField, selections, parsed.types, operationType]);

  const handleCopy = useCallback(async () => {
    if (!generatedQuery) return;
    try {
      await navigator.clipboard.writeText(generatedQuery);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = generatedQuery;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedQuery]);

  const handleSelectAll = () => {
    if (!activeField || !rootTypeName) return;
    const selectAll = (
      fields: GqlField[],
    ): Record<string, SelectedField> => {
      const result: Record<string, SelectedField> = {};
      for (const f of fields) {
        const childType = !f.isScalar ? parsed.types[f.typeName] : null;
        result[f.name] = {
          selected: true,
          args: {},
          children: childType ? selectAll(childType.fields) : {},
        };
      }
      return result;
    };

    const childType = !activeField.isScalar ? parsed.types[activeField.typeName] : null;
    const newChildren = childType ? selectAll(childType.fields) : {};
    setSelections((prev) => ({
      ...prev,
      [activeField.name]: {
        selected: true,
        args: prev[activeField.name]?.args ?? {},
        children: newChildren,
      },
    }));
  };

  const handleClearSelection = () => {
    if (!resolvedActiveField) return;
    setSelections((prev) => ({
      ...prev,
      [resolvedActiveField]: { selected: false, args: {}, children: {} },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Operation type toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Operation:</span>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["query", "mutation"] as const).map((op) => (
            <button
              key={op}
              onClick={() => {
                setOperationType(op);
                setActiveRootField(null);
                setSelections({});
              }}
              className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors cursor-pointer ${
                operationType === op
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
        {!rootType && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
            No {operationType} type found in schema
          </span>
        )}
      </div>

      {/* Three-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Schema */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              SDL Schema
            </label>
            <button
              onClick={() => { setSchema(""); setSelections({}); setActiveRootField(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            value={schema}
            onChange={(e) => {
              setSchema(e.target.value);
              setSelections({});
              setActiveRootField(null);
            }}
            spellCheck={false}
            placeholder={"type Query {\n  user(id: ID!): User\n}\n\ntype User {\n  id: ID!\n  name: String!\n}"}
            className="flex-1 min-h-80 lg:min-h-[520px] p-3 font-mono text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 placeholder-gray-400"
          />
          {/* Type summary */}
          {Object.keys(parsed.types).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.keys(parsed.types).map((t) => (
                <span
                  key={t}
                  className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    t === "Query" || t === "Mutation"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE: Field selector */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Fields
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-violet-600 hover:text-violet-800 cursor-pointer"
              >
                Select all
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleClearSelection}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-80 lg:min-h-[520px]">
            {rootFields.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4 text-center">
                {schema.trim()
                  ? `No ${operationType} fields found. Check your schema.`
                  : "Paste a schema on the left to get started."}
              </div>
            ) : (
              <>
                {/* Root field tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto flex-shrink-0">
                  {rootFields.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveRootField(f.name)}
                      className={`px-3 py-2 text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                        resolvedActiveField === f.name
                          ? "bg-white text-violet-700 border-b-2 border-violet-600 -mb-px font-semibold"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                {/* Field tree for active root field */}
                <div className="flex-1 overflow-y-auto p-3">
                  {activeField && (() => {
                    const childType = !activeField.isScalar
                      ? parsed.types[activeField.typeName]
                      : null;

                    return (
                      <div>
                        {/* The root field itself */}
                        <div className="flex items-center gap-1.5 py-1 mb-1 border-b border-gray-100 pb-2">
                          <input
                            type="checkbox"
                            checked={selections[activeField.name]?.selected ?? false}
                            onChange={() =>
                              handleSelectionChange([activeField.name], {
                                selected: !(selections[activeField.name]?.selected ?? false),
                              })
                            }
                            className="w-3.5 h-3.5 rounded accent-violet-600 cursor-pointer"
                          />
                          <span className="text-sm font-mono font-semibold text-gray-900">
                            {activeField.name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {activeField.rawType}
                          </span>
                        </div>

                        {/* Root field args */}
                        {activeField.args.length > 0 && (
                          <div className="mb-3 p-2.5 bg-violet-50 rounded-lg border border-violet-100 space-y-1.5">
                            <p className="text-xs font-medium text-violet-700 mb-1.5">
                              Arguments
                            </p>
                            {activeField.args.map((arg) => (
                              <div key={arg.name} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-violet-600 w-28 flex-shrink-0 truncate">
                                  {arg.name}
                                  <span className="text-violet-400 ml-1">
                                    {arg.typeName}
                                  </span>
                                </span>
                                <input
                                  type="text"
                                  value={selections[activeField.name]?.args[arg.name] ?? ""}
                                  onChange={(e) =>
                                    handleSelectionChange([activeField.name], {
                                      args: {
                                        ...(selections[activeField.name]?.args ?? {}),
                                        [arg.name]: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="value"
                                  className="flex-1 px-2 py-0.5 text-xs font-mono border border-violet-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Child fields */}
                        {childType ? (
                          childType.fields.map((child) => (
                            <FieldNode
                              key={child.name}
                              field={child}
                              path={[activeField.name, "children", child.name]}
                              types={parsed.types}
                              selNode={selections[activeField.name]?.children[child.name]}
                              onChange={handleSelectionChange}
                              depth={0}
                            />
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 mt-2">
                            Scalar field — no sub-fields to select.
                          </p>
                        )}
                      
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this GraphQL Query Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visual builder for GraphQL queries and mutations. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this GraphQL Query Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visual builder for GraphQL queries and mutations. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Generated query */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Generated Query
            </label>
            <button
              onClick={handleCopy}
              disabled={!generatedQuery}
              className="px-3 py-1 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-80 lg:min-h-[520px]">
            <div className="flex-1 overflow-auto p-4 bg-gray-950">
              {generatedQuery ? (
                <>
                  <style>{`
                    .hl-keyword { color: #c084fc; font-weight: 600; }
                    .hl-type    { color: #67e8f9; }
                    .hl-string  { color: #86efac; }
                    .hl-comment { color: #6b7280; font-style: italic; }
                  `}</style>
                  <pre
                    className="font-mono text-sm text-gray-100 whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{
                      __html: highlightGql(generatedQuery),
                    }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-500">
                  Select a field on the left to generate a query.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "GraphQL Query Builder",
  "description": "Visual builder for GraphQL queries and mutations",
  "url": "https://tools.loresync.dev/graphql-query-builder",
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
