"use client";

import { useState, useMemo } from "react";

const SAMPLE_SPEC = JSON.stringify(
  {
    openapi: "3.0.0",
    info: {
      title: "Petstore API",
      version: "1.0.0",
      description: "A sample API that uses a petstore as an example",
    },
    tags: [
      { name: "pets", description: "Everything about your Pets" },
      { name: "store", description: "Access to Petstore orders" },
    ],
    paths: {
      "/pets": {
        get: {
          tags: ["pets"],
          summary: "List all pets",
          operationId: "listPets",
          parameters: [
            {
              name: "limit",
              in: "query",
              description: "Maximum number of pets to return",
              required: false,
              schema: { type: "integer", format: "int32" },
            },
            {
              name: "status",
              in: "query",
              description: "Filter by status",
              required: false,
              schema: {
                type: "string",
                enum: ["available", "pending", "sold"],
              },
            },
          ],
          responses: {
            "200": {
              description: "A list of pets",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Pet" },
                  },
                },
              },
            },
            "400": { description: "Bad request" },
          },
        },
        post: {
          tags: ["pets"],
          summary: "Create a pet",
          operationId: "createPet",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NewPet" },
              },
            },
          },
          responses: {
            "201": {
              description: "Pet created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Pet" },
                },
              },
            },
            "422": { description: "Validation error" },
          },
        },
      },
      "/pets/{petId}": {
        get: {
          tags: ["pets"],
          summary: "Info for a specific pet",
          operationId: "showPetById",
          parameters: [
            {
              name: "petId",
              in: "path",
              required: true,
              description: "The id of the pet to retrieve",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Expected response to a valid request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Pet" },
                },
              },
            },
            "404": { description: "Pet not found" },
          },
        },
        put: {
          tags: ["pets"],
          summary: "Update a pet",
          operationId: "updatePet",
          parameters: [
            {
              name: "petId",
              in: "path",
              required: true,
              description: "The id of the pet to update",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NewPet" },
              },
            },
          },
          responses: {
            "200": {
              description: "Pet updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Pet" },
                },
              },
            },
            "404": { description: "Pet not found" },
          },
        },
        delete: {
          tags: ["pets"],
          summary: "Delete a pet",
          operationId: "deletePet",
          parameters: [
            {
              name: "petId",
              in: "path",
              required: true,
              description: "The id of the pet to delete",
              schema: { type: "string" },
            },
          ],
          responses: {
            "204": { description: "Pet deleted" },
            "404": { description: "Pet not found" },
          },
        },
      },
      "/store/inventory": {
        get: {
          tags: ["store"],
          summary: "Returns pet inventories by status",
          operationId: "getInventory",
          responses: {
            "200": {
              description: "Successful operation",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: { type: "integer", format: "int32" },
                  },
                },
              },
            },
          },
        },
      },
      "/store/orders": {
        post: {
          tags: ["store"],
          summary: "Place an order for a pet",
          operationId: "placeOrder",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful operation",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Order" },
                },
              },
            },
            "400": { description: "Invalid order" },
          },
        },
      },
    },
    components: {
      schemas: {
        Pet: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: { type: "integer", format: "int64", description: "Unique pet ID" },
            name: { type: "string", description: "Name of the pet" },
            tag: { type: "string", description: "Optional tag" },
            status: {
              type: "string",
              enum: ["available", "pending", "sold"],
              description: "Pet status in the store",
            },
          },
        },
        NewPet: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Name of the pet" },
            tag: { type: "string", description: "Optional tag" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", format: "int64" },
            petId: { type: "integer", format: "int64" },
            quantity: { type: "integer", format: "int32" },
            status: {
              type: "string",
              enum: ["placed", "approved", "delivered"],
            },
            complete: { type: "boolean" },
          },
        },
      },
    },
  },
  null,
  2
);

type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";

interface Endpoint {
  path: string;
  method: HttpMethod;
  tag: string;
  summary: string;
  operationId?: string;
  parameters?: Record<string, unknown>[];
  requestBody?: Record<string, unknown>;
  responses?: Record<string, unknown>;
}

const METHOD_STYLES: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  get:     { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300" },
  post:    { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300" },
  put:     { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  patch:   { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  delete:  { bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300" },
  head:    { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300" },
  options: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
};

function MethodBadge({ method }: { method: HttpMethod }) {
  const s = METHOD_STYLES[method] ?? METHOD_STYLES.get;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase border ${s.bg} ${s.text} ${s.border} min-w-[56px] justify-center`}
    >
      {method}
    </span>
  );
}

function SchemaView({ schema, depth = 0 }: { schema: unknown; depth?: number }) {
  if (!schema || typeof schema !== "object") {
    return <span className="text-gray-500 text-xs">{String(schema)}</span>;
  }

  const s = schema as Record<string, unknown>;

  if (s["$ref"]) {
    const ref = String(s["$ref"]);
    const name = ref.split("/").pop();
    return <span className="text-indigo-600 text-xs font-mono">{name}</span>;
  }

  if (s.type === "array" && s.items) {
    return (
      <span className="text-xs font-mono">
        <span className="text-gray-500">array of </span>
        <SchemaView schema={s.items} depth={depth} />
      </span>
    );
  }

  if (s.type === "object" && s.properties) {
    const props = s.properties as Record<string, unknown>;
    const required = (s.required as string[]) ?? [];
    if (depth > 1) {
      return <span className="text-xs font-mono text-gray-500">object</span>;
    }
    return (
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="pr-3 py-1 font-medium">field</th>
            <th className="pr-3 py-1 font-medium">type</th>
            <th className="py-1 font-medium">description</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(props).map(([key, val]) => {
            const v = val as Record<string, unknown>;
            const isReq = required.includes(key);
            return (
              <tr key={key} className="border-b border-gray-100 last:border-0">
                <td className="pr-3 py-1 font-mono">
                  {key}
                  {isReq && <span className="text-red-500 ml-0.5">*</span>}
                </td>
                <td className="pr-3 py-1">
                  <SchemaView schema={val} depth={depth + 1} />
                  {v.enum && (
                    <div className="text-gray-400 mt-0.5">
                      [{(v.enum as unknown[]).map(String).join(", ")}]
                    </div>
                  )}
                </td>
                <td className="py-1 text-gray-500">{v.description as string}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  const typeStr = [s.type, s.format].filter(Boolean).join(" / ");
  return (
    <span className="text-xs font-mono text-gray-700">
      {typeStr || "object"}
      {s.enum && (
        <span className="text-gray-400 ml-1">
          [{(s.enum as unknown[]).map(String).join(", ")}]
        </span>
      )}
    </span>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  const params = endpoint.parameters ?? [];
  const reqBody = endpoint.requestBody as Record<string, unknown> | undefined;
  const responses = endpoint.responses as Record<string, Record<string, unknown>> | undefined;

  const bodySchema = useMemo(() => {
    if (!reqBody) return null;
    const content = reqBody.content as Record<string, Record<string, unknown>> | undefined;
    if (!content) return null;
    const firstKey = Object.keys(content)[0];
    return firstKey ? (content[firstKey]?.schema ?? null) : null;
  }, [reqBody]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <MethodBadge method={endpoint.method} />
        <span className="font-mono text-sm text-gray-800 flex-1 break-all">{endpoint.path}</span>
        {endpoint.summary && (
          <span className="text-sm text-gray-500 hidden sm:block truncate max-w-xs">
            {endpoint.summary}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-5 bg-gray-50">
          {endpoint.summary && (
            <p className="text-sm text-gray-700 font-medium">{endpoint.summary}</p>
          )}
          {endpoint.operationId && (
            <p className="text-xs text-gray-400 font-mono">operationId: {endpoint.operationId}</p>
          )}

          {/* Parameters */}
          {params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Parameters
              </h4>
              <div className="overflow-x-auto">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pr-3 pb-1 font-medium">name</th>
                      <th className="pr-3 pb-1 font-medium">in</th>
                      <th className="pr-3 pb-1 font-medium">type</th>
                      <th className="pr-3 pb-1 font-medium">required</th>
                      <th className="pb-1 font-medium">description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((p, i) => {
                      const param = p as Record<string, unknown>;
                      const schema = param.schema as Record<string, unknown> | undefined;
                      return (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className="pr-3 py-1 font-mono text-gray-800">{String(param.name)}</td>
                          <td className="pr-3 py-1">
                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                              {String(param.in)}
                            </span>
                          </td>
                          <td className="pr-3 py-1 font-mono text-gray-700">
                            {schema
                              ? [schema.type, schema.format].filter(Boolean).join(" / ")
                              : "—"}
                            {schema?.enum && (
                              <div className="text-gray-400">
                                [{(schema.enum as unknown[]).map(String).join(", ")}]
                              </div>
                            )}
                          </td>
                          <td className="pr-3 py-1">
                            {param.required ? (
                              <span className="text-red-500 font-semibold">yes</span>
                            ) : (
                              <span className="text-gray-400">no</span>
                            )}
                          </td>
                          <td className="py-1 text-gray-500">{String(param.description ?? "")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body */}
          {bodySchema && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Request Body
                {(reqBody as Record<string, unknown>).required && (
                  <span className="text-red-400 ml-1 normal-case font-normal">(required)</span>
                )}
              </h4>
              <div className="bg-white border border-gray-200 rounded p-3">
                <SchemaView schema={bodySchema} />
              </div>
            </div>
          )}

          {/* Responses */}
          {responses && Object.keys(responses).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Responses
              </h4>
              <div className="space-y-2">
                {Object.entries(responses).map(([code, resp]) => {
                  const r = resp as Record<string, unknown>;
                  const content = r.content as Record<string, Record<string, unknown>> | undefined;
                  const firstContentKey = content ? Object.keys(content)[0] : null;
                  const respSchema = firstContentKey
                    ? content![firstContentKey]?.schema
                    : null;
                  const codeNum = parseInt(code, 10);
                  const codeColor =
                    codeNum >= 500
                      ? "text-red-600 bg-red-50 border-red-200"
                      : codeNum >= 400
                      ? "text-orange-600 bg-orange-50 border-orange-200"
                      : codeNum >= 300
                      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                      : "text-green-600 bg-green-50 border-green-200";

                  return (
                    <div key={code} className="border border-gray-200 rounded overflow-hidden">
                      <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono border-b border-gray-200 ${codeColor}`}>
                        <span className="font-bold">{code}</span>
                        <span className="font-normal text-gray-600">{String(r.description ?? "")}</span>
                      </div>
                      {respSchema && (
                        <div className="bg-white p-3">
                          <SchemaView schema={respSchema} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function parseSpec(text: string): { endpoints: Endpoint[]; info: Record<string, unknown> | null; error: string | null } {
  try {
    const spec = JSON.parse(text) as Record<string, unknown>;
    const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;
    const info = spec.info as Record<string, unknown> | null;

    if (!paths) {
      return { endpoints: [], info, error: "No 'paths' found in spec." };
    }

    const endpoints: Endpoint[] = [];
    const methods: HttpMethod[] = ["get", "post", "put", "patch", "delete", "head", "options"];

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const method of methods) {
        const op = pathItem[method] as Record<string, unknown> | undefined;
        if (!op) continue;
        const tags = (op.tags as string[] | undefined) ?? [];
        const tag = tags[0] ?? "default";
        endpoints.push({
          path,
          method,
          tag,
          summary: String(op.summary ?? ""),
          operationId: op.operationId ? String(op.operationId) : undefined,
          parameters: op.parameters as Record<string, unknown>[] | undefined,
          requestBody: op.requestBody as Record<string, unknown> | undefined,
          responses: op.responses as Record<string, unknown> | undefined,
        });
      }
    }

    return { endpoints, info, error: null };
  } catch (e) {
    return { endpoints: [], info: null, error: `JSON parse error: ${(e as Error).message}` };
  }
}

export default function OpenApiExplorer() {
  const [text, setText] = useState(SAMPLE_SPEC);
  const [search, setSearch] = useState("");
  const [collapsedTags, setCollapsedTags] = useState<Set<string>>(new Set());

  const { endpoints, info, error } = useMemo(() => parseSpec(text), [text]);

  const filtered = useMemo(() => {
    if (!search.trim()) return endpoints;
    const q = search.toLowerCase();
    return endpoints.filter(
      (e) =>
        e.path.toLowerCase().includes(q) ||
        e.method.includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tag.toLowerCase().includes(q) ||
        (e.operationId?.toLowerCase().includes(q) ?? false)
    );
  }, [endpoints, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Endpoint[]>();
    for (const ep of filtered) {
      if (!map.has(ep.tag)) map.set(ep.tag, []);
      map.get(ep.tag)!.push(ep);
    }
    return map;
  }, [filtered]);

  const toggleTag = (tag: string) => {
    setCollapsedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const totalEndpoints = endpoints.length;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            OpenAPI 3.x JSON Spec
          </label>
          <button
            onClick={() => setText(SAMPLE_SPEC)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Load sample (Petstore)
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          spellCheck={false}
          className="w-full font-mono text-xs border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-gray-50"
          placeholder='Paste your OpenAPI 3.x JSON spec here...'
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* API Info */}
      {info && !error && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-bold text-indigo-900">{String(info.title ?? "")}</h2>
            {info.version && (
              <span className="text-xs bg-indigo-200 text-indigo-800 rounded px-1.5 py-0.5 font-mono">
                v{String(info.version)}
              </span>
            )}
          </div>
          {info.description && (
            <p className="text-sm text-indigo-700 mt-1">{String(info.description)}</p>
          )}
          <p className="text-xs text-indigo-500 mt-1">
            {totalEndpoints} endpoint{totalEndpoints !== 1 ? "s" : ""} across {grouped.size} tag{grouped.size !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Search + Results */}
      {!error && totalEndpoints > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoints by path, method, tag, or summary..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No endpoints match your search.</p>
          ) : (
            <div className="space-y-4">
              {[...grouped.entries()].map(([tag, eps]) => (
                <div key={tag}>
                  <button
                    onClick={() => toggleTag(tag)}
                    className="w-full flex items-center gap-2 mb-2 group"
                  >
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${collapsedTags.has(tag) ? "-rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-700 capitalize group-hover:text-gray-900">
                      {tag}
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {eps.length}
                    </span>
                  </button>

                  {!collapsedTags.has(tag) && (
                    <div className="space-y-2 ml-6">
                      {eps.map((ep, i) => (
                        <EndpointCard key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
