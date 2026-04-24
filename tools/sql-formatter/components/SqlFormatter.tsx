"use client";

import { useState, useCallback } from "react";

// --- SQL Keywords ---
const MAJOR_CLAUSES = [
  "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "FULL JOIN", "FULL OUTER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN",
  "CROSS JOIN", "NATURAL JOIN", "ON", "AND", "OR", "ORDER BY", "GROUP BY",
  "HAVING", "LIMIT", "OFFSET", "UNION", "UNION ALL", "INTERSECT", "EXCEPT",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE",
  "ALTER TABLE", "DROP TABLE", "CREATE INDEX", "DROP INDEX", "CASE", "WHEN",
  "THEN", "ELSE", "END", "AS", "IN", "NOT IN", "EXISTS", "NOT EXISTS",
  "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL", "DISTINCT", "INTO", "RETURNING",
];

const ALL_KEYWORDS = [
  ...MAJOR_CLAUSES, "ASC", "DESC", "NULL", "NOT", "TRUE", "FALSE",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "DEFAULT", "CONSTRAINT",
  "UNIQUE", "INDEX", "CHECK", "CASCADE", "RESTRICT", "IF", "REPLACE",
  "TEMPORARY", "TEMP", "VIEW", "TRIGGER", "PROCEDURE", "FUNCTION",
  "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION", "GRANT", "REVOKE",
  "ALL", "ANY", "SOME", "TOP", "FETCH", "NEXT", "ROWS", "ONLY",
  "WITH", "RECURSIVE", "OVER", "PARTITION BY", "ROW_NUMBER", "RANK",
  "DENSE_RANK", "LAG", "LEAD", "FIRST_VALUE", "LAST_VALUE", "COUNT",
  "SUM", "AVG", "MIN", "MAX", "COALESCE", "NULLIF", "CAST",
  "CONVERT", "SUBSTRING", "TRIM", "UPPER", "LOWER", "LENGTH",
  "CONCAT", "REPLACE", "ILIKE",
];

const NEWLINE_BEFORE = new Set([
  "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "FULL JOIN", "FULL OUTER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN",
  "CROSS JOIN", "NATURAL JOIN", "ORDER BY", "GROUP BY", "HAVING",
  "LIMIT", "OFFSET", "UNION", "UNION ALL", "INTERSECT", "EXCEPT",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE",
  "ALTER TABLE", "DROP TABLE", "RETURNING", "WITH",
]);

const INDENT_AFTER = new Set([
  "SELECT", "SET", "VALUES",
]);

const INDENT_KEYWORDS = new Set(["AND", "OR", "ON"]);

// --- Tokenizer ---
type TokenType = "keyword" | "string" | "number" | "comment" | "paren" | "comma" | "operator" | "whitespace" | "plain";

interface Token {
  type: TokenType;
  value: string;
  upper: string;
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < sql.length) {
    // Whitespace
    if (/\s/.test(sql[i])) {
      let start = i;
      while (i < sql.length && /\s/.test(sql[i])) i++;
      tokens.push({ type: "whitespace", value: sql.slice(start, i), upper: " " });
      continue;
    }

    // Single-line comment --
    if (sql[i] === "-" && sql[i + 1] === "-") {
      let start = i;
      while (i < sql.length && sql[i] !== "\n") i++;
      tokens.push({ type: "comment", value: sql.slice(start, i), upper: sql.slice(start, i).toUpperCase() });
      continue;
    }

    // Multi-line comment /* */
    if (sql[i] === "/" && sql[i + 1] === "*") {
      let start = i;
      i += 2;
      while (i < sql.length && !(sql[i - 1] === "*" && sql[i] === "/")) i++;
      i++;
      tokens.push({ type: "comment", value: sql.slice(start, i), upper: sql.slice(start, i).toUpperCase() });
      continue;
    }

    // String (single quote)
    if (sql[i] === "'") {
      let start = i;
      i++;
      while (i < sql.length && (sql[i] !== "'" || sql[i + 1] === "'")) {
        if (sql[i] === "'" && sql[i + 1] === "'") i++;
        i++;
      }
      i++;
      tokens.push({ type: "string", value: sql.slice(start, i), upper: sql.slice(start, i) });
      continue;
    }

    // Parentheses
    if (sql[i] === "(" || sql[i] === ")") {
      tokens.push({ type: "paren", value: sql[i], upper: sql[i] });
      i++;
      continue;
    }

    // Comma
    if (sql[i] === ",") {
      tokens.push({ type: "comma", value: ",", upper: "," });
      i++;
      continue;
    }

    // Semicolon
    if (sql[i] === ";") {
      tokens.push({ type: "operator", value: ";", upper: ";" });
      i++;
      continue;
    }

    // Operators
    if (/[=<>!+\-*/%&|^~]/.test(sql[i])) {
      let start = i;
      // Handle multi-char operators
      if ((sql[i] === "<" || sql[i] === ">" || sql[i] === "!" || sql[i] === "=") && sql[i + 1] === "=") i++;
      if (sql[i] === "<" && sql[i + 1] === ">") i++;
      if (sql[i] === "|" && sql[i + 1] === "|") i++;
      i++;
      tokens.push({ type: "operator", value: sql.slice(start, i), upper: sql.slice(start, i) });
      continue;
    }

    // Numbers
    if (/\d/.test(sql[i])) {
      let start = i;
      while (i < sql.length && /[\d.]/.test(sql[i])) i++;
      tokens.push({ type: "number", value: sql.slice(start, i), upper: sql.slice(start, i) });
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_]/.test(sql[i])) {
      let start = i;
      while (i < sql.length && /[a-zA-Z0-9_.]/.test(sql[i])) i++;
      const word = sql.slice(start, i);
      const upper = word.toUpperCase();
      const isKw = ALL_KEYWORDS.some((k) => k === upper);
      tokens.push({ type: isKw ? "keyword" : "plain", value: word, upper });
      continue;
    }

    // Anything else
    tokens.push({ type: "plain", value: sql[i], upper: sql[i] });
    i++;
  }

  return tokens;
}

// --- Check multi-word keywords ---
function matchMultiWordKeyword(tokens: Token[], idx: number): { keyword: string; count: number } | null {
  // Try 3-word, 2-word combos
  const combos = [4, 3, 2];
  for (const len of combos) {
    const parts: string[] = [];
    let j = idx;
    let consumed = 0;
    while (parts.length < len && j < tokens.length) {
      if (tokens[j].type === "whitespace") { j++; consumed++; continue; }
      parts.push(tokens[j].upper);
      j++;
      consumed++;
    }
    if (parts.length === len) {
      const candidate = parts.join(" ");
      if (NEWLINE_BEFORE.has(candidate) || INDENT_KEYWORDS.has(candidate) || ALL_KEYWORDS.some(k => k === candidate)) {
        return { keyword: candidate, count: consumed };
      }
    }
  }
  return null;
}

// --- Formatter ---
function formatSql(sql: string, options: { keywordCase: "upper" | "lower"; indentSize: number }): string {
  const tokens = tokenize(sql);
  const indent = " ".repeat(options.indentSize);
  let result = "";
  let indentLevel = 0;
  let parenDepth = 0;
  let i = 0;
  let lineStart = true;

  const addNewline = () => {
    result = result.trimEnd();
    result += "\n" + indent.repeat(indentLevel);
    lineStart = true;
  };

  const applyCase = (word: string, upper: string) => {
    const isKw = ALL_KEYWORDS.some((k) => k === upper);
    if (isKw) {
      return options.keywordCase === "upper" ? upper : upper.toLowerCase();
    }
    return word;
  };

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "whitespace") {
      if (!lineStart) result += " ";
      i++;
      continue;
    }

    if (token.type === "comment") {
      addNewline();
      result += token.value;
      addNewline();
      i++;
      continue;
    }

    // Check for multi-word keywords
    if (token.type === "keyword") {
      const multi = matchMultiWordKeyword(tokens, i);
      if (multi && multi.count > 1) {
        const kw = multi.keyword;
        if (NEWLINE_BEFORE.has(kw) && parenDepth === 0) {
          if (INDENT_AFTER.has(kw)) {
            addNewline();
            result += applyCase(kw, kw);
            indentLevel++;
            addNewline();
          } else {
            if (kw === "AND" || kw === "OR") {
              addNewline();
              result += applyCase(kw, kw);
            } else {
              indentLevel = kw === "FROM" || kw === "WHERE" || kw === "ORDER BY" || kw === "GROUP BY" || kw === "HAVING" || kw === "LIMIT" || kw === "OFFSET" ? 0 : indentLevel;
              addNewline();
              result += applyCase(kw, kw);
              if (INDENT_AFTER.has(kw)) {
                indentLevel++;
                addNewline();
              }
            }
          }
        } else {
          if (!lineStart) result += " ";
          result += applyCase(kw, kw);
        }
        lineStart = false;
        i += multi.count;
        continue;
      }
    }

    if (token.type === "keyword") {
      const kw = token.upper;

      if (NEWLINE_BEFORE.has(kw) && parenDepth === 0) {
        if (INDENT_AFTER.has(kw)) {
          indentLevel = 0;
          addNewline();
          result += applyCase(token.value, kw);
          indentLevel = 1;
          addNewline();
        } else {
          if (kw === "AND" || kw === "OR") {
            addNewline();
            result += applyCase(token.value, kw);
          } else if (kw === "ON") {
            result += " " + applyCase(token.value, kw);
          } else {
            if (kw === "FROM" || kw === "WHERE" || kw === "HAVING" || kw === "LIMIT" || kw === "OFFSET" || kw === "RETURNING" || kw === "WITH") {
              indentLevel = 0;
            }
            addNewline();
            result += applyCase(token.value, kw);
          }
        }
        lineStart = false;
        i++;
        continue;
      }

      // CASE/END handling
      if (kw === "CASE") {
        if (!lineStart) result += " ";
        result += applyCase(token.value, kw);
        indentLevel++;
        lineStart = false;
        i++;
        continue;
      }
      if (kw === "END") {
        indentLevel = Math.max(0, indentLevel - 1);
        addNewline();
        result += applyCase(token.value, kw);
        lineStart = false;
        i++;
        continue;
      }
      if (kw === "WHEN" || kw === "THEN" || kw === "ELSE") {
        addNewline();
        result += applyCase(token.value, kw);
        lineStart = false;
        i++;
        continue;
      }

      if (!lineStart) result += " ";
      result += applyCase(token.value, kw);
      lineStart = false;
      i++;
      continue;
    }

    if (token.type === "paren") {
      if (token.value === "(") {
        result += " (";
        parenDepth++;
      } else {
        parenDepth = Math.max(0, parenDepth - 1);
        result += ")";
      }
      lineStart = false;
      i++;
      continue;
    }

    if (token.type === "comma") {
      result += ",";
      if (parenDepth === 0) {
        addNewline();
      }
      lineStart = false;
      i++;
      continue;
    }

    if (token.value === ";") {
      result += ";\n";
      indentLevel = 0;
      parenDepth = 0;
      lineStart = true;
      i++;
      continue;
    }

    if (!lineStart && token.type !== "operator") result += " ";
    if (token.type === "operator") {
      result += " " + token.value + " ";
    } else {
      result += token.value;
    }
    lineStart = false;
    i++;
  }

  return result.trim();
}

// --- Minify ---
function minifySql(sql: string): string {
  const tokens = tokenize(sql);
  let result = "";
  let prevNonWs: Token | null = null;

  for (const token of tokens) {
    if (token.type === "comment") continue;
    if (token.type === "whitespace") {
      if (prevNonWs && prevNonWs.type !== "operator" && prevNonWs.type !== "paren" && prevNonWs.value !== ",") {
        result += " ";
      }
      continue;
    }
    result += token.value;
    prevNonWs = token;
  }

  return result.replace(/ +/g, " ").trim();
}

// --- Syntax Highlighter ---
function highlightSql(sql: string): React.ReactNode[] {
  const tokens = tokenize(sql);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const key = i;

    switch (t.type) {
      case "keyword":
        elements.push(<span key={key} className="sql-keyword">{t.value}</span>);
        break;
      case "string":
        elements.push(<span key={key} className="sql-string">{t.value}</span>);
        break;
      case "number":
        elements.push(<span key={key} className="sql-number">{t.value}</span>);
        break;
      case "comment":
        elements.push(<span key={key} className="sql-comment">{t.value}</span>);
        break;
      case "paren":
        elements.push(<span key={key} className="sql-paren">{t.value}</span>);
        break;
      case "operator":
        elements.push(<span key={key} className="sql-operator">{t.value}</span>);
        break;
      default:
        elements.push(<span key={key} className="sql-plain">{t.value}</span>);
    }
  }

  return elements;
}

// --- Component ---
const SAMPLE_SQL = `select u.id, u.name, u.email, o.total_amount, o.created_at from users u inner join orders o on u.id = o.user_id where o.status = 'completed' and o.total_amount > 100 order by o.created_at desc limit 50;`;

export default function SqlFormatter() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [keywordCase, setKeywordCase] = useState<"upper" | "lower">("upper");
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);

  const formatted = formatSql(input, { keywordCase, indentSize });
  const highlighted = highlightSql(formatted);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [formatted]);

  const handleMinify = useCallback(() => {
    setInput(minifySql(input));
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  return (
    <div className="space-y-4">
      {/* Options Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2 text-gray-700">
          Keywords:
          <select
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as "upper" | "lower")}
            className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-gray-700">
          Indent:
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Input SQL</h2>
            <div className="flex gap-2">
              <button
                onClick={handleMinify}
                className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer"
              >
                Minify
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-80 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Paste your SQL here..."
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Formatted SQL</h2>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer"
            >
              {copied ? (
                <span className="checkmark-animate text-green-600">Copied!</span>
              ) : (
                "Copy"
              )}
            </button>
          </div>
          <pre className="w-full h-80 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-gray-50 overflow-auto whitespace-pre-wrap break-words">
            {input.trim() ? highlighted : <span className="text-gray-400">Formatted SQL will appear here...</span>}
          </pre>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "SQLを整形するメリットは？", a: "インデントと改行を統一することで可読性が上がり、レビューやデバッグが効率化されます。チーム開発でのスタイル統一にも役立ちます。" },
            { q: "対応しているSQLの種類は？", a: "SELECT・INSERT・UPDATE・DELETE・CREATE TABLEなど標準的なDML・DDL文に対応しています。MySQL・PostgreSQL・SQLiteなど主要なデータベースのSQL構文をサポートします。" },
            { q: "SQLの圧縮（ミニファイ）もできますか？", a: "はい。フォーマットモードを「圧縮」に切り替えると、改行・空白を除去したコンパクトなSQL文に変換できます。URLパラメータや組み込みSQLに便利です。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "SQLを整形するメリットは？", "acceptedAnswer": { "@type": "Answer", "text": "インデントと改行を統一することで可読性が上がり、レビューやデバッグが効率化されます。" } },
              { "@type": "Question", "name": "対応しているSQLの種類は？", "acceptedAnswer": { "@type": "Answer", "text": "SELECT・INSERT・UPDATE・DELETE・CREATE TABLEなど標準的なDML・DDL文に対応しています。" } },
              { "@type": "Question", "name": "SQLの圧縮（ミニファイ）もできますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。フォーマットモードを圧縮に切り替えると、改行・空白を除去したコンパクトなSQL文に変換できます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/json-formatter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">JSON フォーマッター</a>
            <a href="/xml-formatter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">XML フォーマッター</a>
          </div>
        </div>
      </div>
    </div>
  );
}
