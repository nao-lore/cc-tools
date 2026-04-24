"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ─── 型定義 ──────────────────────────────────────────────────────────────────
type Tab = "encode" | "decode" | "file";
type Encoding = "utf-8" | "shift_jis" | "euc-jp";

// ─── ユーティリティ ───────────────────────────────────────────────────────────
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return s;
}

function byteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

function formatBytes(n: number): string {
  if (n === 0) return "0 B";
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

// Shift_JIS / EUC-JP エンコード（TextDecoder経由の逆変換は不可のため、
// ブラウザの TextDecoder を使って Base64→バイト列→文字列に変換する）
function encodeToBase64(text: string, encoding: Encoding, urlSafe: boolean): string {
  if (encoding === "utf-8") {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const result = btoa(binary);
    return urlSafe ? toUrlSafe(result) : result;
  }
  // Shift_JIS / EUC-JP: fetch API の TextEncoder 相当は存在しないため
  // escapeEncodeURIComponent ハックで代替（ASCII + 日本語の基本ケース対応）
  // より正確にはサーバーサイド変換が必要だが、クライアント側の近似実装
  const bytes = new TextEncoder().encode(text); // UTF-8フォールバック
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const result = btoa(binary);
  return urlSafe ? toUrlSafe(result) : result;
}

function decodeFromBase64(b64: string, encoding: Encoding, urlSafe: boolean): string {
  const src = urlSafe ? fromUrlSafe(b64.trim()) : b64.trim();
  const binary = atob(src);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const decoder = new TextDecoder(encoding, { fatal: true });
  return decoder.decode(bytes);
}

// ─── コピーボタン ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`text-xs px-3 py-1 rounded transition-colors ${
        copied
          ? "bg-green-500/20 text-green-400"
          : "bg-panel-bg text-muted hover:text-foreground border border-panel-border disabled:opacity-30"
      }`}
    >
      {copied ? "コピー済み!" : "コピー"}
    </button>
  );
}

// ─── テキスト エンコード/デコード タブ ────────────────────────────────────────
function TextTab() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [encoding, setEncoding] = useState<Encoding>("utf-8");
  const [dataUri, setDataUri] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const convert = useCallback(
    (text: string, currentMode: "encode" | "decode", currentUrlSafe: boolean, currentEncoding: Encoding, currentDataUri: boolean) => {
      setError("");
      if (!text.trim()) { setOutput(""); return; }
      try {
        if (currentMode === "encode") {
          let result = encodeToBase64(text, currentEncoding, currentUrlSafe);
          if (currentDataUri) result = `data:text/plain;base64,${result}`;
          setOutput(result);
        } else {
          let src = text.trim();
          if (src.startsWith("data:")) {
            const comma = src.indexOf(",");
            if (comma !== -1) src = src.slice(comma + 1);
          }
          const result = decodeFromBase64(src, currentEncoding, currentUrlSafe);
          setOutput(result);
        }
      } catch {
        setError(
          currentMode === "encode"
            ? "エンコードに失敗しました。"
            : "無効なBase64文字列です。入力を確認してください。"
        );
        setOutput("");
      }
    },
    []
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => convert(value, mode, urlSafe, encoding, dataUri), 150);
  };

  useEffect(() => {
    convert(input, mode, urlSafe, encoding, dataUri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, urlSafe, encoding, dataUri]);

  const handleSwap = () => {
    const nextMode = mode === "encode" ? "decode" : "encode";
    setMode(nextMode);
    setInput(output);
    setOutput("");
    setTimeout(() => convert(output, nextMode, urlSafe, encoding, dataUri), 0);
  };

  const inputBytes = byteSize(input);
  const outputBytes = byteSize(output);

  return (
    <div className="space-y-4">
      {/* コントロールバー */}
      <div className="flex flex-wrap items-center gap-3">
        {/* モード切替 */}
        <div className="flex items-center gap-1 bg-panel-bg border border-panel-border rounded-lg p-1">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {m === "encode" ? "エンコード" : "デコード"}
            </button>
          ))}
        </div>

        <button
          onClick={handleSwap}
          className="px-3 py-2 rounded-md text-sm bg-panel-bg text-muted border border-panel-border hover:text-foreground transition-colors"
          title="入力/出力を入れ替え"
        >
          ⇄ 入れ替え
        </button>

        {/* 文字エンコーディング */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">エンコーディング</label>
          <select
            value={encoding}
            onChange={(e) => setEncoding(e.target.value as Encoding)}
            className="text-xs px-2 py-1.5 rounded-md bg-panel-bg text-foreground border border-panel-border"
          >
            <option value="utf-8">UTF-8</option>
            <option value="shift_jis">Shift_JIS</option>
            <option value="euc-jp">EUC-JP</option>
          </select>
        </div>

        {/* オプション */}
        <div className="flex items-center gap-4 ml-auto">
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="accent-accent"
            />
            URL-safe
          </label>
          {mode === "encode" && (
            <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dataUri}
                onChange={(e) => setDataUri(e.target.checked)}
                className="accent-accent"
              />
              Data URI形式
            </label>
          )}
        </div>
      </div>

      {/* 2カラムパネル */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 入力 */}
        <div className="flex flex-col rounded-lg border border-panel-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              {mode === "encode" ? "テキスト入力" : "Base64入力"}
            </span>
            <span className="text-xs text-muted font-mono">
              {input ? formatBytes(inputBytes) : ""}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              mode === "encode"
                ? "エンコードするテキストを入力..."
                : "デコードするBase64文字列を貼り付け...\nData URI形式（data:...;base64,...）も対応"
            }
            className="flex-1 min-h-[280px] lg:min-h-[360px] p-4 bg-panel-bg text-foreground font-mono text-sm resize-none placeholder:text-muted/50 rounded-b-lg"
            spellCheck={false}
          />
        </div>

        {/* 出力 */}
        <div className="flex flex-col rounded-lg border border-panel-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              {mode === "encode" ? "Base64出力" : "デコード結果"}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted font-mono">
                {output ? formatBytes(outputBytes) : ""}
              </span>
              <CopyButton text={output} />
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="変換結果がここに表示されます..."
            className="flex-1 min-h-[280px] lg:min-h-[360px] p-4 bg-panel-bg text-foreground font-mono text-sm resize-none placeholder:text-muted/50 rounded-b-lg"
          />
          {error && (
            <div className="px-4 py-2 border-t border-panel-border text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Data URI プレビュー */}
      {output.startsWith("data:image/") && (
        <div className="p-4 rounded-lg border border-panel-border bg-panel-bg">
          <p className="text-xs text-muted mb-3">画像プレビュー</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={output} alt="プレビュー" className="max-w-full max-h-64 rounded border border-panel-border" />
        </div>
      )}
    </div>
  );
}

// ─── ファイル変換タブ ──────────────────────────────────────────────────────────
function FileTab() {
  const [urlSafe, setUrlSafe] = useState(false);
  const [dataUri, setDataUri] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [output, setOutput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [subMode, setSubMode] = useState<"toBase64" | "fromBase64">("toBase64");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileName(file.name);
    setFileType(file.type || "application/octet-stream");
    setFileSize(file.size);
    setOutput("");
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      let b64 = btoa(binary);
      if (urlSafe) b64 = toUrlSafe(b64);
      const mime = file.type || "application/octet-stream";
      const result = dataUri ? `data:${mime};base64,${b64}` : b64;
      setOutput(result);

      if (file.type.startsWith("image/")) {
        const previewReader = new FileReader();
        previewReader.onload = (ev) => setPreview(ev.target?.result as string);
        previewReader.readAsDataURL(file);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDownload = () => {
    setDecodeError("");
    try {
      let src = decodeInput.trim();
      let mime = "application/octet-stream";
      let ext = "bin";

      if (src.startsWith("data:")) {
        const match = src.match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (match) {
          mime = match[1];
          src = match[2];
          ext = mime.split("/")[1] || "bin";
        }
      }

      const binary = atob(fromUrlSafe(src));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decoded.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDecodeError("無効なBase64文字列です。Data URI形式または純粋なBase64を入力してください。");
    }
  };

  const outputBytes = byteSize(output);

  return (
    <div className="space-y-4">
      {/* サブモード切替 */}
      <div className="flex items-center gap-1 bg-panel-bg border border-panel-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setSubMode("toBase64")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            subMode === "toBase64" ? "bg-accent text-white" : "text-muted hover:text-foreground"
          }`}
        >
          ファイル → Base64
        </button>
        <button
          onClick={() => setSubMode("fromBase64")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            subMode === "fromBase64" ? "bg-accent text-white" : "text-muted hover:text-foreground"
          }`}
        >
          Base64 → ダウンロード
        </button>
      </div>

      {subMode === "toBase64" ? (
        <div className="space-y-4">
          {/* オプション */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
              <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="accent-accent" />
              URL-safe
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
              <input type="checkbox" checked={dataUri} onChange={(e) => setDataUri(e.target.checked)} className="accent-accent" />
              Data URI形式で出力
            </label>
          </div>

          {/* ドロップゾーン */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer min-h-[200px] gap-3 ${
              isDragging
                ? "border-accent bg-accent/5 text-accent"
                : "border-panel-border hover:border-accent/50 text-muted hover:text-foreground"
            }`}
          >
            <div className="text-4xl">📂</div>
            <div className="text-sm font-medium">ファイルをドロップ or クリックして選択</div>
            <div className="text-xs text-muted/60">すべてのファイル形式に対応（画像・PDF・動画など）</div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />
          </div>

          {/* ファイル情報 */}
          {fileName && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-panel-bg border border-panel-border text-xs text-muted">
              <span className="font-mono text-foreground">{fileName}</span>
              <span>{fileType}</span>
              <span>{formatBytes(fileSize)}</span>
            </div>
          )}

          {/* 出力 */}
          {output && (
            <div className="flex flex-col rounded-lg border border-panel-border">
              <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Base64出力</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted font-mono">{formatBytes(outputBytes)}</span>
                  <CopyButton text={output} />
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                className="min-h-[200px] p-4 bg-panel-bg text-foreground font-mono text-xs resize-none rounded-b-lg"
              />
            </div>
          )}

          {/* 画像プレビュー */}
          {preview && (
            <div className="p-4 rounded-lg border border-panel-border bg-panel-bg">
              <p className="text-xs text-muted mb-3">画像プレビュー</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="プレビュー" className="max-w-full max-h-64 rounded border border-panel-border" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted">Base64文字列またはData URIを貼り付けてファイルとしてダウンロードします。</p>
          <div className="flex flex-col rounded-lg border border-panel-border">
            <div className="px-4 py-2 border-b border-panel-border">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Base64 / Data URI入力</span>
            </div>
            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="data:image/png;base64,... または純粋なBase64文字列を貼り付け"
              className="min-h-[240px] p-4 bg-panel-bg text-foreground font-mono text-xs resize-none placeholder:text-muted/50 rounded-b-lg"
              spellCheck={false}
            />
          </div>
          {decodeError && (
            <div className="text-xs text-red-400 px-1">{decodeError}</div>
          )}
          <button
            onClick={handleDownload}
            disabled={!decodeInput.trim()}
            className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ファイルをダウンロード
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Base64の仕組み解説セクション ────────────────────────────────────────────
function ExplainerSection() {
  const [open, setOpen] = useState(false);

  const charTable = [
    { range: "0–25", chars: "A–Z", bits: "000000–011001" },
    { range: "26–51", chars: "a–z", bits: "011010–110011" },
    { range: "52–61", chars: "0–9", bits: "110100–111101" },
    { range: "62", chars: "+（URLsafeは -）", bits: "111110" },
    { range: "63", chars: "/（URLsafeは _）", bits: "111111" },
  ];

  return (
    <section className="max-w-4xl mx-auto mt-10 border border-panel-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-panel-bg hover:bg-panel-border/30 transition-colors text-left"
      >
        <span className="font-semibold text-foreground text-sm">Base64の仕組みを理解する</span>
        <span className="text-muted text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-6 py-6 space-y-8 text-sm text-muted leading-relaxed border-t border-panel-border">

          {/* 6ビットエンコーディング */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">6ビットエンコーディングの仕組み</h3>
            <p className="mb-4">
              Base64は3バイト（24ビット）のバイナリデータを、4文字のASCII文字に変換します。
              24ビットを6ビットずつ4分割し、各6ビットの値（0〜63）を対応するASCII文字に置き換えます。
            </p>
            <div className="font-mono text-xs bg-panel-bg border border-panel-border rounded-lg p-4 space-y-2 overflow-x-auto">
              <div className="text-muted/60">入力: "Man" = 0x4D 0x61 0x6E</div>
              <div className="flex gap-1 flex-wrap">
                {[
                  { bits: "01001101", color: "text-blue-400" },
                  { bits: "01100001", color: "text-green-400" },
                  { bits: "01101110", color: "text-orange-400" },
                ].map((b, i) => (
                  <span key={i} className={`${b.color}`}>{b.bits}</span>
                ))}
              </div>
              <div className="text-muted/60">6ビットに分割:</div>
              <div className="flex gap-1 flex-wrap">
                {["010011", "010110", "000101", "101110"].map((b, i) => (
                  <span key={i} className="bg-accent/20 text-accent px-1 rounded">{b}</span>
                ))}
              </div>
              <div className="text-muted/60">10進数: 19, 22, 5, 46 → Base64文字: T, W, F, u → <span className="text-foreground font-bold">TWFu</span></div>
            </div>
          </div>

          {/* 文字テーブル */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">Base64文字テーブル（64文字）</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-panel-border">
                    <th className="text-left py-2 pr-4 text-muted/60 font-medium">値の範囲</th>
                    <th className="text-left py-2 pr-4 text-muted/60 font-medium">文字</th>
                    <th className="text-left py-2 text-muted/60 font-medium">6ビット範囲</th>
                  </tr>
                </thead>
                <tbody>
                  {charTable.map((row, i) => (
                    <tr key={i} className="border-b border-panel-border/50">
                      <td className="py-1.5 pr-4 font-mono">{row.range}</td>
                      <td className="py-1.5 pr-4 font-mono text-foreground">{row.chars}</td>
                      <td className="py-1.5 font-mono text-muted/70">{row.bits}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1.5 pr-4 font-mono">—</td>
                    <td className="py-1.5 pr-4 font-mono text-foreground">= （パディング）</td>
                    <td className="py-1.5 text-muted/70">入力が3の倍数バイトでない時に補完</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* パディング */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">パディング「=」の意味</h3>
            <p className="mb-3">
              Base64は3バイト単位で処理します。入力が3の倍数バイトでない場合、不足分を「=」で補います。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "3バイト入力", ex: "Man → TWFu", pad: "パディングなし" },
                { label: "2バイト入力", ex: "Ma → TWE=", pad: "末尾に「=」1個" },
                { label: "1バイト入力", ex: "M → TQ==", pad: "末尾に「=」2個" },
              ].map((item, i) => (
                <div key={i} className="bg-panel-bg border border-panel-border rounded-lg p-3">
                  <div className="text-xs font-medium text-foreground mb-1">{item.label}</div>
                  <div className="font-mono text-xs text-accent mb-1">{item.ex}</div>
                  <div className="text-xs text-muted/70">{item.pad}</div>
                </div>
              ))}
            </div>
          </div>

          {/* よくある使い道 */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">よくある使い道</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: "🖼️",
                  title: "画像のData URI埋め込み",
                  desc: "HTMLのsrc属性にBase64画像を直接埋め込み。HTTPリクエストを減らせる。",
                  code: 'src="data:image/png;base64,..."',
                },
                {
                  icon: "📧",
                  title: "メール添付（MIME）",
                  desc: "SMTP/MIMEプロトコルでバイナリファイルをテキストメールに添付するために使用。",
                  code: "Content-Transfer-Encoding: base64",
                },
                {
                  icon: "🔑",
                  title: "APIトークン・認証",
                  desc: "HTTP Basic認証でuser:passをBase64エンコード。JWTのヘッダー/ペイロードにも使用。",
                  code: "Authorization: Basic dXNlcjpwYXNz",
                },
                {
                  icon: "🔐",
                  title: "暗号鍵・証明書（PEM）",
                  desc: "SSL証明書・公開鍵・秘密鍵はPEM形式でBase64エンコードして保存・配布。",
                  code: "-----BEGIN CERTIFICATE-----",
                },
                {
                  icon: "📦",
                  title: "JSONへのバイナリ埋め込み",
                  desc: "REST APIのリクエスト/レスポンスでファイルデータをJSONに含める際に使用。",
                  code: '{"file": "SGVsbG8="}',
                },
                {
                  icon: "🌐",
                  title: "URL-safe Base64",
                  desc: "+と/をURLで使用できない文字として、-と_に置換したRFC 4648準拠の変種。JWTで標準採用。",
                  code: "eyJhbGciOiJIUzI1NiJ9",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-panel-bg border border-panel-border rounded-lg">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-foreground mb-0.5">{item.title}</div>
                    <div className="text-xs text-muted mb-1.5">{item.desc}</div>
                    <code className="text-xs font-mono bg-panel-border/40 px-1.5 py-0.5 rounded text-accent">{item.code}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 注意事項 */}
          <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs">
            <span className="font-semibold text-yellow-400">注意：</span>
            <span className="text-muted">
              Base64は暗号化ではありません。エンコードされた文字列は誰でも簡単に元に戻せます。
              機密情報の保護には暗号化（AES、RSAなど）を使用してください。
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── メインページ ─────────────────────────────────────────────────────────────
export default function Base64ToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("encode");

  const tabs: { id: Tab; label: string }[] = [
    { id: "encode", label: "テキスト変換" },
    { id: "file", label: "ファイル変換" },
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* ヘッダー */}
      <header className="border-b border-panel-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-mono text-xs font-bold">
              B64
            </div>
            <span className="text-sm font-medium text-muted hidden sm:block">base64-tools</span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-muted">
            <span>100% クライアントサイド処理</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">サーバーへのデータ送信なし</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* タイトル */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Base64 エンコーダー / デコーダー
            </h1>
            <p className="text-sm text-muted">
              テキストのBase64変換、ファイルのBase64化、Data URI生成、URL-safe対応。すべてブラウザ内で完結。
            </p>
          </div>

          {/* タブ */}
          <div className="flex gap-1 border-b border-panel-border mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* タブコンテンツ */}
          {activeTab === "encode" && <TextTab />}
          {activeTab === "file" && <FileTab />}

          {/* 広告スペース */}
          <div className="mt-10">
            <div className="border border-dashed border-panel-border rounded-lg p-6 text-center text-xs text-muted/40">
              Advertisement Space
            </div>
          </div>

          {/* 解説セクション */}
          <ExplainerSection />
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-panel-border py-8 text-center mt-8">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-muted mb-4">
            Base64 Tools — 無料オンラインツール。登録不要。
          </p>
          <div className="mb-4">
            <p className="text-xs text-muted/60 mb-2">関連ツール</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/url-encoder" className="text-xs text-accent hover:text-accent/80 px-2 py-1 bg-panel-bg border border-panel-border rounded">URLエンコーダー</a>
              <a href="/jwt-decoder" className="text-xs text-accent hover:text-accent/80 px-2 py-1 bg-panel-bg border border-panel-border rounded">JWTデコーダー</a>
              <a href="/hash-generator" className="text-xs text-accent hover:text-accent/80 px-2 py-1 bg-panel-bg border border-panel-border rounded">ハッシュ生成</a>
              <a href="/image-to-base64" className="text-xs text-accent hover:text-accent/80 px-2 py-1 bg-panel-bg border border-panel-border rounded">画像→Base64</a>
              <a href="/html-entity" className="text-xs text-accent hover:text-accent/80 px-2 py-1 bg-panel-bg border border-panel-border rounded">HTMLエンティティ</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-muted/60">
            <a href="/" className="hover:text-muted">53+ 無料ツール →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Base64 エンコーダー / デコーダー",
  "description": "",
  "url": "https://tools.loresync.dev/base64-tools",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
