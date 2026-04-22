"use client";

import { useState, useCallback } from "react";

interface ValidationError {
  path: string;
  message: string;
}

type SchemaType = "string" | "number" | "integer" | "boolean" | "array" | "object" | "null";

interface JsonSchema {
  type?: SchemaType | SchemaType[];
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  enum?: unknown[];
  pattern?: string;
  $ref?: string;
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  definitions?: Record<string, JsonSchema>;
  $defs?: Record<string, JsonSchema>;
  format?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
  const?: unknown;
  multipleOf?: number;
}

function getType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function isInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value);
}

function resolveRef(ref: string, rootSchema: JsonSchema): JsonSchema | null {
  if (!ref.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/");
  let current: unknown = rootSchema;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }
  return current as JsonSchema;
}

function validateSchema(
  data: unknown,
  schema: JsonSchema,
  path: string,
  rootSchema: JsonSchema,
  errors: ValidationError[]
): void {
  // Handle $ref
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, rootSchema);
    if (resolved) {
      validateSchema(data, resolved, path, rootSchema, errors);
    }
    return;
  }

  // Handle allOf
  if (schema.allOf) {
    for (const subSchema of schema.allOf) {
      validateSchema(data, subSchema, path, rootSchema, errors);
    }
  }

  // Handle anyOf
  if (schema.anyOf) {
    const anyValid = schema.anyOf.some((subSchema) => {
      const subErrors: ValidationError[] = [];
      validateSchema(data, subSchema, path, rootSchema, subErrors);
      return subErrors.length === 0;
    });
    if (!anyValid) {
      errors.push({ path, message: "Value must match at least one of the given schemas" });
    }
  }

  // Handle oneOf
  if (schema.oneOf) {
    const matchCount = schema.oneOf.filter((subSchema) => {
      const subErrors: ValidationError[] = [];
      validateSchema(data, subSchema, path, rootSchema, subErrors);
      return subErrors.length === 0;
    }).length;
    if (matchCount !== 1) {
      errors.push({ path, message: `Value must match exactly one schema (matched ${matchCount})` });
    }
  }

  // Handle not
  if (schema.not !== undefined) {
    const subErrors: ValidationError[] = [];
    validateSchema(data, schema.not, path, rootSchema, subErrors);
    if (subErrors.length === 0) {
      errors.push({ path, message: "Value must NOT match the given schema" });
    }
  }

  // type check
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actualType = getType(data);
    const typeMatches = types.some((t) => {
      if (t === "integer") return isInteger(data);
      return t === actualType;
    });
    if (!typeMatches) {
      const expected = types.join(" or ");
      errors.push({
        path,
        message: `Expected type "${expected}" but got "${actualType}"`,
      });
      return; // further checks won't be meaningful
    }
  }

  // const
  if ("const" in schema) {
    if (JSON.stringify(data) !== JSON.stringify(schema.const)) {
      errors.push({ path, message: `Value must be ${JSON.stringify(schema.const)}` });
    }
  }

  // enum
  if (schema.enum !== undefined) {
    const match = schema.enum.some((v) => JSON.stringify(v) === JSON.stringify(data));
    if (!match) {
      errors.push({
        path,
        message: `Value must be one of: ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}`,
      });
    }
  }

  // String validations
  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({ path, message: `String length ${data.length} is less than minLength ${schema.minLength}` });
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({ path, message: `String length ${data.length} exceeds maxLength ${schema.maxLength}` });
    }
    if (schema.pattern !== undefined) {
      try {
        const re = new RegExp(schema.pattern);
        if (!re.test(data)) {
          errors.push({ path, message: `String does not match pattern "${schema.pattern}"` });
        }
      } catch {
        errors.push({ path, message: `Invalid regex pattern "${schema.pattern}"` });
      }
    }
  }

  // Number validations
  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({ path, message: `Value ${data} is less than minimum ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({ path, message: `Value ${data} exceeds maximum ${schema.maximum}` });
    }
    if (schema.exclusiveMinimum !== undefined && data <= schema.exclusiveMinimum) {
      errors.push({ path, message: `Value ${data} must be greater than ${schema.exclusiveMinimum}` });
    }
    if (schema.exclusiveMaximum !== undefined && data >= schema.exclusiveMaximum) {
      errors.push({ path, message: `Value ${data} must be less than ${schema.exclusiveMaximum}` });
    }
    if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
      errors.push({ path, message: `Value ${data} is not a multiple of ${schema.multipleOf}` });
    }
  }

  // Object validations
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const objKeys = Object.keys(obj);

    if (schema.minProperties !== undefined && objKeys.length < schema.minProperties) {
      errors.push({ path, message: `Object has ${objKeys.length} properties, minimum is ${schema.minProperties}` });
    }
    if (schema.maxProperties !== undefined && objKeys.length > schema.maxProperties) {
      errors.push({ path, message: `Object has ${objKeys.length} properties, maximum is ${schema.maxProperties}` });
    }

    // required
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            message: `Required property "${key}" is missing`,
          });
        }
      }
    }

    // properties
    if (schema.properties) {
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          validateSchema(
            obj[key],
            subSchema,
            path ? `${path}.${key}` : key,
            rootSchema,
            errors
          );
        }
      }
    }

    // additionalProperties
    if (schema.additionalProperties !== undefined && schema.properties) {
      const knownKeys = new Set(Object.keys(schema.properties));
      const extra = objKeys.filter((k) => !knownKeys.has(k));
      if (schema.additionalProperties === false) {
        for (const key of extra) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            message: `Additional property "${key}" is not allowed`,
          });
        }
      } else if (typeof schema.additionalProperties === "object") {
        for (const key of extra) {
          validateSchema(
            obj[key],
            schema.additionalProperties,
            path ? `${path}.${key}` : key,
            rootSchema,
            errors
          );
        }
      }
    }
  }

  // Array validations
  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push({ path, message: `Array has ${data.length} items, minimum is ${schema.minItems}` });
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push({ path, message: `Array has ${data.length} items, maximum is ${schema.maxItems}` });
    }
    if (schema.uniqueItems) {
      const seen = new Set<string>();
      for (let i = 0; i < data.length; i++) {
        const key = JSON.stringify(data[i]);
        if (seen.has(key)) {
          errors.push({ path: `${path}[${i}]`, message: `Duplicate item at index ${i}` });
        }
        seen.add(key);
      }
    }
    if (schema.items) {
      for (let i = 0; i < data.length; i++) {
        validateSchema(
          data[i],
          schema.items,
          `${path}[${i}]`,
          rootSchema,
          errors
        );
      }
    }
  }
}

const SAMPLE_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "age", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 120
    },
    "email": {
      "type": "string",
      "pattern": "^[^@]+@[^@]+\\\\.[^@]+$"
    },
    "role": {
      "type": "string",
      "enum": ["admin", "user", "guest"]
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    }
  },
  "additionalProperties": false
}`;

const SAMPLE_DATA = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "role": "admin",
  "tags": ["developer", "designer"]
}`;

const SAMPLE_DATA_INVALID = `{
  "name": "A",
  "age": -5,
  "email": "not-an-email",
  "role": "superuser",
  "tags": ["dev", "dev"],
  "extra": "not allowed"
}`;

export default function JsonSchemaValidator() {
  const [schema, setSchema] = useState("");
  const [data, setData] = useState("");
  const [errors, setErrors] = useState<ValidationError[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const handleValidate = useCallback(() => {
    setParseError(null);
    setErrors(null);
    setValidated(false);

    let parsedSchema: JsonSchema;
    let parsedData: unknown;

    try {
      parsedSchema = JSON.parse(schema);
    } catch (e) {
      setParseError(`Schema parse error: ${(e as Error).message}`);
      return;
    }

    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      setParseError(`Data parse error: ${(e as Error).message}`);
      return;
    }

    const errs: ValidationError[] = [];
    validateSchema(parsedData, parsedSchema, "$", parsedSchema, errs);
    setErrors(errs);
    setValidated(true);
  }, [schema, data]);

  const handleLoadSample = useCallback((valid: boolean) => {
    setSchema(SAMPLE_SCHEMA);
    setData(valid ? SAMPLE_DATA : SAMPLE_DATA_INVALID);
    setErrors(null);
    setParseError(null);
    setValidated(false);
  }, []);

  const handleClear = useCallback(() => {
    setSchema("");
    setData("");
    setErrors(null);
    setParseError(null);
    setValidated(false);
  }, []);

  const isPass = validated && errors !== null && errors.length === 0;
  const isFail = validated && errors !== null && errors.length > 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleValidate}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Validate
        </button>
        <button
          onClick={() => handleLoadSample(true)}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Sample (valid)
        </button>
        <button
          onClick={() => handleLoadSample(false)}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Sample (invalid)
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Schema */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            JSON Schema
          </label>
          <textarea
            value={schema}
            onChange={(e) => {
              setSchema(e.target.value);
              setValidated(false);
              setErrors(null);
              setParseError(null);
            }}
            placeholder='Paste your JSON Schema here...\n\n{"type": "object", ...}'
            spellCheck={false}
            className="w-full h-96 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            JSON Data
          </label>
          <textarea
            value={data}
            onChange={(e) => {
              setData(e.target.value);
              setValidated(false);
              setErrors(null);
              setParseError(null);
            }}
            placeholder='Paste your JSON data here...\n\n{"name": "Alice", ...}'
            spellCheck={false}
            className="w-full h-96 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-mono">
          {parseError}
        </div>
      )}

      {/* Results panel */}
      {validated && errors !== null && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Result header */}
          <div
            className={`flex items-center gap-3 px-4 py-3 ${
              isPass ? "bg-green-50 border-b border-green-100" : "bg-red-50 border-b border-red-100"
            }`}
          >
            <span
              className={`inline-flex items-center gap-2 text-sm font-semibold ${
                isPass ? "text-green-700" : "text-red-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isPass ? "bg-green-500" : "bg-red-500"}`}
              />
              {isPass
                ? "Validation passed — JSON data matches the schema"
                : `Validation failed — ${errors.length} error${errors.length !== 1 ? "s" : ""} found`}
            </span>
          </div>

          {/* Error list */}
          {isFail && (
            <ul className="divide-y divide-gray-100 bg-white">
              {errors.map((err, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mr-2 mb-0.5">
                      {err.path}
                    </span>
                    <span className="text-sm text-gray-700">{err.message}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
