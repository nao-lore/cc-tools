"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "rust"
  | "go"
  | "sql"
  | "html"
  | "css"
  | "json"
  | "bash"
  | "java"
  | "cpp"
  | "ruby"
  | "php";

type Theme = "dark" | "light";

interface Token {
  type: "keyword" | "string" | "comment" | "number" | "punctuation" | "plain";
  value: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
];

const KEYWORDS: Record<Language, string[]> = {
  javascript: [
    "const","let","var","function","return","if","else","for","while","do",
    "switch","case","break","continue","new","delete","typeof","instanceof",
    "class","extends","import","export","default","from","async","await",
    "try","catch","finally","throw","null","undefined","true","false","this",
    "super","static","get","set","of","in","void","yield",
  ],
  typescript: [
    "const","let","var","function","return","if","else","for","while","do",
    "switch","case","break","continue","new","delete","typeof","instanceof",
    "class","extends","import","export","default","from","async","await",
    "try","catch","finally","throw","null","undefined","true","false","this",
    "super","static","get","set","of","in","void","yield","interface","type",
    "enum","implements","declare","namespace","abstract","readonly","as","is",
    "keyof","infer","never","any","unknown","string","number","boolean","object",
  ],
  python: [
    "def","class","return","if","elif","else","for","while","in","not","and",
    "or","import","from","as","try","except","finally","raise","with","pass",
    "break","continue","lambda","yield","async","await","True","False","None",
    "global","nonlocal","del","assert","is","print","len","range","self",
  ],
  rust: [
    "fn","let","mut","const","static","struct","enum","impl","trait","type",
    "use","mod","pub","priv","return","if","else","for","while","loop","match",
    "break","continue","true","false","self","super","crate","ref","move",
    "where","async","await","dyn","Box","Vec","Option","Result","Some","None",
    "Ok","Err","String","str","i32","i64","u32","u64","f32","f64","bool","usize",
  ],
  go: [
    "func","var","const","type","struct","interface","package","import","return",
    "if","else","for","range","switch","case","default","break","continue","goto",
    "defer","go","chan","map","select","fallthrough","nil","true","false",
    "make","new","len","cap","append","copy","close","delete","panic","recover",
    "string","int","int64","float64","bool","byte","error","any",
  ],
  sql: [
    "SELECT","FROM","WHERE","AND","OR","NOT","IN","EXISTS","LIKE","BETWEEN",
    "JOIN","INNER","LEFT","RIGHT","FULL","OUTER","ON","GROUP","BY","ORDER",
    "HAVING","LIMIT","OFFSET","INSERT","INTO","VALUES","UPDATE","SET","DELETE",
    "CREATE","TABLE","INDEX","VIEW","DROP","ALTER","ADD","COLUMN","PRIMARY",
    "KEY","FOREIGN","REFERENCES","UNIQUE","NULL","NOT","DEFAULT","AS","DISTINCT",
    "COUNT","SUM","AVG","MIN","MAX","CASE","WHEN","THEN","ELSE","END","WITH",
    "UNION","ALL","INTERSECT","EXCEPT","TRUNCATE","COMMIT","ROLLBACK","BEGIN",
  ],
  html: [
    "html","head","body","div","span","p","a","img","input","button","form",
    "label","select","option","textarea","table","tr","td","th","thead","tbody",
    "ul","ol","li","nav","header","footer","main","section","article","aside",
    "h1","h2","h3","h4","h5","h6","pre","code","script","style","link","meta",
    "title","br","hr","strong","em","i","b","u","canvas","video","audio",
  ],
  css: [
    "display","position","flex","grid","margin","padding","width","height",
    "color","background","border","font","text","align","justify","overflow",
    "z-index","top","left","right","bottom","absolute","relative","fixed",
    "sticky","block","inline","none","auto","solid","dashed","dotted","inherit",
    "initial","important","px","em","rem","vh","vw","%","transition","animation",
    "transform","opacity","cursor","pointer","content","before","after","hover",
    "focus","active","nth","child","not","media","import","keyframes","var",
  ],
  json: [],
  bash: [
    "if","then","else","elif","fi","for","in","do","done","while","until",
    "case","esac","function","return","exit","echo","export","local","readonly",
    "declare","let","true","false","break","continue","shift","source","alias",
    "unset","set","read","printf","test","cd","ls","pwd","mkdir","rm","mv","cp",
    "cat","grep","sed","awk","find","curl","wget","chmod","chown","kill","ps",
    "sudo","apt","brew","git","npm","yarn","python","node","make",
  ],
  java: [
    "class","interface","enum","extends","implements","import","package","public",
    "private","protected","static","final","abstract","native","synchronized",
    "volatile","transient","new","return","if","else","for","while","do","switch",
    "case","default","break","continue","try","catch","finally","throw","throws",
    "null","true","false","this","super","void","int","long","short","byte",
    "float","double","boolean","char","String","Object","List","Map","Set",
  ],
  cpp: [
    "int","long","short","char","float","double","bool","void","auto","const",
    "static","extern","register","volatile","signed","unsigned","struct","class",
    "union","enum","namespace","template","typename","typedef","using","public",
    "private","protected","virtual","override","final","inline","explicit",
    "return","if","else","for","while","do","switch","case","default","break",
    "continue","new","delete","try","catch","throw","nullptr","true","false",
    "this","sizeof","operator","friend","mutable","constexpr","noexcept",
  ],
  ruby: [
    "def","end","class","module","return","if","elsif","else","unless","then",
    "for","while","until","do","case","when","begin","rescue","ensure","raise",
    "yield","self","super","nil","true","false","and","or","not","in","include",
    "extend","require","require_relative","attr","attr_accessor","attr_reader",
    "attr_writer","puts","print","p","lambda","proc","new","initialize",
  ],
  php: [
    "function","class","interface","extends","implements","namespace","use",
    "return","if","elseif","else","for","foreach","while","do","switch","case",
    "default","break","continue","try","catch","finally","throw","new","echo",
    "print","var","const","static","public","private","protected","abstract",
    "final","null","true","false","this","self","parent","array","string","int",
    "float","bool","void","match","fn","readonly","enum",
  ],
};

// ─── Tokenizer ────────────────────────────────────────────────────────────────

function tokenizeLine(line: string, lang: Language): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const keywords = new Set(KEYWORDS[lang]);

  // Comment prefixes per language
  const lineCommentPrefix: Record<Language, string | null> = {
    javascript: "//", typescript: "//", rust: "//", go: "//",
    java: "//", cpp: "//", php: "//",
    python: "#", ruby: "#", bash: "#",
    sql: "--", html: null, css: "/*", json: null,
  };

  const commentStart = lineCommentPrefix[lang];

  while (i < line.length) {
    // HTML/XML tags
    if (lang === "html" && line[i] === "<") {
      let j = i + 1;
      while (j < line.length && line[j] !== ">") j++;
      j = Math.min(j + 1, line.length);
      const tagContent = line.slice(i, j);
      // color tag name as keyword, attributes as plain
      tokens.push({ type: "keyword", value: tagContent });
      i = j;
      continue;
    }

    // Line comments
    if (commentStart && line.slice(i).startsWith(commentStart)) {
      tokens.push({ type: "comment", value: line.slice(i) });
      break;
    }

    // Strings: single or double quoted
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\" ) { j += 2; continue; }
        if (line[j] === quote) { j++; break; }
        j++;
      }
      tokens.push({ type: "string", value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(line[i]) && (i === 0 || /\W/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9._xXa-fA-FbBoO]/.test(line[j])) j++;
      tokens.push({ type: "number", value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Words (keywords or plain)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isKeyword = lang === "sql"
        ? keywords.has(word.toUpperCase())
        : keywords.has(word);
      tokens.push({ type: isKeyword ? "keyword" : "plain", value: word });
      i = j;
      continue;
    }

    // Punctuation
    if (/[{}()[\];,.:=<>!&|+\-*/%^~?@#]/.test(line[i])) {
      tokens.push({ type: "punctuation", value: line[i] });
      i++;
      continue;
    }

    // Everything else (whitespace, etc.)
    tokens.push({ type: "plain", value: line[i] });
    i++;
  }

  return tokens;
}

// ─── HTML Exporter ────────────────────────────────────────────────────────────

const TOKEN_COLORS_DARK: Record<Token["type"], string> = {
  keyword: "#60a5fa",    // blue-400
  string: "#4ade80",     // green-400
  comment: "#9ca3af",    // gray-400
  number: "#fb923c",     // orange-400
  punctuation: "#e5e7eb",
  plain: "#e5e7eb",
};

const TOKEN_COLORS_LIGHT: Record<Token["type"], string> = {
  keyword: "#1d4ed8",    // blue-700
  string: "#15803d",     // green-700
  comment: "#6b7280",    // gray-500
  number: "#c2410c",     // orange-700
  punctuation: "#111827",
  plain: "#111827",
};

function buildHtml(
  code: string,
  lang: Language,
  theme: Theme,
  showLineNumbers: boolean,
  fontSize: number,
  tabSize: number
): string {
  const expandedCode = code.replace(/\t/g, " ".repeat(tabSize));
  const lines = expandedCode.split("\n");
  const colors = theme === "dark" ? TOKEN_COLORS_DARK : TOKEN_COLORS_LIGHT;
  const bg = theme === "dark" ? "#111827" : "#ffffff";
  const lineBg = theme === "dark" ? "#1f2937" : "#f9fafb";
  const gutterColor = theme === "dark" ? "#6b7280" : "#9ca3af";
  const borderColor = theme === "dark" ? "#374151" : "#e5e7eb";

  const lineHtmls = lines.map((line, idx) => {
    const tokens = tokenizeLine(line, lang);
    const tokenSpans = tokens
      .map((t) => `<span style="color:${colors[t.type]}">${escapeHtml(t.value)}</span>`)
      .join("");

    const lineNum = showLineNumbers
      ? `<span style="display:inline-block;width:2.5em;text-align:right;margin-right:1em;color:${gutterColor};user-select:none;flex-shrink:0">${idx + 1}</span>`
      : "";

    return `<div style="display:flex;align-items:baseline;min-height:1.5em">${lineNum}<span style="white-space:pre">${tokenSpans || "\u200b"}</span></div>`;
  });

  return `<pre style="background:${bg};padding:1.25em;border-radius:0.5em;font-family:ui-monospace,'Fira Code','Cascadia Code',monospace;font-size:${fontSize}px;line-height:1.6;overflow:auto;border:1px solid ${borderColor}"><code>${lineHtmls.join("\n")}</code></pre>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Preview renderer ─────────────────────────────────────────────────────────

interface HighlightedLineProps {
  line: string;
  lang: Language;
  theme: Theme;
}

function HighlightedLine({ line, lang, theme }: HighlightedLineProps) {
  const colors = theme === "dark" ? TOKEN_COLORS_DARK : TOKEN_COLORS_LIGHT;
  const tokens = tokenizeLine(line, lang);
  return (
    <span>
      {tokens.map((token, i) => (
        <span key={i} style={{ color: colors[token.type] }}>
          {token.value}
        </span>
      ))}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const PLACEHOLDER: Record<Language, string> = {
  javascript: `function greet(name) {\n  // Say hello\n  const msg = "Hello, " + name;\n  return msg;\n}\n\nconsole.log(greet("World"));`,
  typescript: `interface User {\n  id: number;\n  name: string;\n}\n\nconst greet = (user: User): string => {\n  return \`Hello, \${user.name}\`;\n};`,
  python: `def greet(name: str) -> str:\n    # Say hello\n    return f"Hello, {name}"\n\nprint(greet("World"))`,
  rust: `fn main() {\n    let name = "World";\n    println!("Hello, {}!", name);\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    name := "World"\n    fmt.Printf("Hello, %s!\\n", name)\n}`,
  sql: `SELECT u.id, u.name, COUNT(o.id) AS orders\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE u.active = true\nGROUP BY u.id, u.name\nORDER BY orders DESC\nLIMIT 10;`,
  html: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Hello</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n  </body>\n</html>`,
  css: `.container {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 1rem 2rem;\n  background: #f9fafb;\n  border-radius: 0.5rem;\n}`,
  json: `{\n  "name": "my-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build"\n  },\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}`,
  bash: `#!/bin/bash\n# Deploy script\nset -e\n\necho "Building..."\nnpm run build\n\necho "Deploying..."\ngit push origin main`,
  java: `public class Greeter {\n    public static void main(String[] args) {\n        // Say hello\n        String name = "World";\n        System.out.println("Hello, " + name + "!");\n    }\n}`,
  cpp: `#include <iostream>\n#include <string>\n\nint main() {\n    // Say hello\n    std::string name = "World";\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}`,
  ruby: `# Greeter module\ndef greet(name)\n  "Hello, #{name}!"\nend\n\nputs greet("World")`,
  php: `<?php\n// Say hello\nfunction greet(string $name): string {\n    return "Hello, " . $name . "!";\n}\n\necho greet("World");`,
};

export default function CodeSnippetFormatter() {
  const [code, setCode] = useState("");
  const [lang, setLang] = useState<Language>("javascript");
  const [theme, setTheme] = useState<Theme>("dark");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);

  const displayCode = code || PLACEHOLDER[lang];
  const expandedCode = displayCode.replace(/\t/g, " ".repeat(tabSize));
  const lines = expandedCode.split("\n");

  const bg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const gutterText = theme === "dark" ? "text-gray-500" : "text-gray-400";

  const handleCopyHtml = useCallback(async () => {
    const html = buildHtml(displayCode, lang, theme, showLineNumbers, fontSize, tabSize);
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayCode, lang, theme, showLineNumbers, fontSize, tabSize]);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-2 transition-colors ${
                theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-2 border-l border-gray-300 transition-colors ${
                theme === "light"
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Light
            </button>
          </div>
        </div>

        {/* Font size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size: <span className="text-indigo-600 font-semibold">{fontSize}px</span>
          </label>
          <input
            type="range"
            min={11}
            max={20}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-32 accent-indigo-600"
          />
        </div>

        {/* Tab size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tab Size
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            {([2, 4] as const).map((ts) => (
              <button
                key={ts}
                onClick={() => setTabSize(ts)}
                className={`px-3 py-2 transition-colors ${
                  tabSize === ts
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } ${ts === 4 ? "border-l border-gray-300" : ""}`}
              >
                {ts}
              </button>
            ))}
          </div>
        </div>

        {/* Line numbers */}
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Line numbers</span>
          </label>
        </div>
      </div>

      {/* Main grid: input + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code Input
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Paste your code here — preview updates instantly
          </p>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={PLACEHOLDER[lang]}
            rows={18}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            spellCheck={false}
          />
          <p className="text-xs text-gray-400 mt-1">
            {lines.length} line{lines.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Highlighted Preview
            </label>
            <button
              onClick={handleCopyHtml}
              className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              {copied ? "Copied!" : "Copy HTML"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Styled HTML ready to embed anywhere
          </p>
          <div
            className={`w-full rounded-lg border ${border} ${bg} overflow-auto`}
            style={{ minHeight: "420px", maxHeight: "480px" }}
          >
            <div
              className="px-4 py-3 font-mono"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            >
              {lines.map((line, idx) => {
                const expanded = line.replace(/\t/g, " ".repeat(tabSize));
                return (
                  <div key={idx} className="flex items-baseline min-h-[1.5em]">
                    {showLineNumbers && (
                      <span
                        className={`inline-block w-10 text-right mr-4 flex-shrink-0 select-none ${gutterText}`}
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {idx + 1}
                      </span>
                    )}
                    <span className="whitespace-pre">
                      <HighlightedLine line={expanded} lang={lang} theme={theme} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
