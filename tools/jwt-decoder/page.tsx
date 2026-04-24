"use client";

import { useState, useCallback } from "react";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface DecodedJWT {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  error?: string;
}

interface ClaimMeta {
  label: string;
  labelJa: string;
  description: string;
  isTimestamp?: boolean;
}

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------
const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ilx1NWM3MVx1OTFjZlx1MzA1Zlx1MzA4YiIsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJhdWQiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSIsImlhdCI6MTcxNjIzOTAyMiwibmJmIjoxNzE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjIsImp0aSI6ImFiYzEyMyIsInJvbGUiOiJhZG1pbiJ9." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const CLAIM_META: Record<string, ClaimMeta> = {
  iss: {
    label: "Issuer",
    labelJa: "発行者",
    description: "このトークンを発行したサービスの識別子（例: https://example.com）",
  },
  sub: {
    label: "Subject",
    labelJa: "主体",
    description: "このトークンが表すユーザーやエンティティの識別子（例: ユーザーID）",
  },
  aud: {
    label: "Audience",
    labelJa: "対象受信者",
    description: "このトークンを受け入れるべきサービスの識別子",
  },
  exp: {
    label: "Expiration Time",
    labelJa: "有効期限",
    description: "この時刻を過ぎるとトークンは無効になります（Unixタイムスタンプ）",
    isTimestamp: true,
  },
  iat: {
    label: "Issued At",
    labelJa: "発行日時",
    description: "トークンが発行された日時（Unixタイムスタンプ）",
    isTimestamp: true,
  },
  nbf: {
    label: "Not Before",
    labelJa: "有効開始日時",
    description: "この時刻より前はトークンを使用できません（Unixタイムスタンプ）",
    isTimestamp: true,
  },
  jti: {
    label: "JWT ID",
    labelJa: "トークンID",
    description: "このトークン固有の識別子。リプレイアタック防止に使われます",
  },
};

// ----------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

function decodeJWT(token: string): DecodedJWT {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: "",
      error: `無効なJWT: 3つのパートが必要ですが、${parts.length}つ見つかりました`,
    };
  }
  let header: Record<string, unknown> | null = null;
  let payload: Record<string, unknown> | null = null;
  let error: string | undefined;
  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
  } catch {
    error = "Headerのデコードに失敗しました";
  }
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    error = (error ? error + " / " : "") + "Payloadのデコードに失敗しました";
  }
  return { header, payload, signature: parts[2], error };
}

function formatUnixTime(ts: number): string {
  return new Date(ts * 1000).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function formatDuration(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}日`);
  if (h > 0) parts.push(`${h}時間`);
  if (m > 0) parts.push(`${m}分`);
  if (parts.length === 0) parts.push(`${seconds}秒`);
  return parts.join("");
}

function getExpirationStatus(payload: Record<string, unknown> | null) {
  if (!payload || typeof payload.exp !== "number") return null;
  const now = Math.floor(Date.now() / 1000);
  const diff = payload.exp - now;
  return { isExpired: diff < 0, diff, exp: payload.exp };
}

function syntaxHighlightJson(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);
  const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span class="text-sky-400">${match.slice(0, -1)}</span>:`;
        }
        return `<span class="text-emerald-400">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="text-amber-400">${match}</span>`;
      if (/null/.test(match)) return `<span class="text-red-400">${match}</span>`;
      return `<span class="text-violet-400">${match}</span>`;
    }
  );
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------
function TokenColorDisplay({ token }: { token: string }) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  return (
    <div className="p-4 rounded-lg bg-gray-900 font-mono text-sm break-all leading-relaxed">
      <span className="text-blue-400">{parts[0]}</span>
      <span className="text-gray-500">.</span>
      <span className="text-purple-400">{parts[1]}</span>
      <span className="text-gray-500">.</span>
      <span className="text-red-400">{parts[2]}</span>
    </div>
  );
}

function JsonPanel({
  title,
  titleJa,
  colorClass,
  data,
}: {
  title: string;
  titleJa: string;
  colorClass: string;
  data: Record<string, unknown> | null;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className={`flex items-center justify-between px-4 py-2 ${colorClass}`}>
        <div>
          <span className="text-sm font-bold text-white">{title}</span>
          <span className="text-xs text-white/70 ml-2">{titleJa}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
        >
          {copied ? "コピー済み!" : "コピー"}
        </button>
      </div>
      <div className="bg-gray-900 p-4 overflow-x-auto">
        {data ? (
          <pre
            className="text-sm font-mono leading-relaxed whitespace-pre"
            dangerouslySetInnerHTML={{ __html: syntaxHighlightJson(data) }}
          />
        ) : (
          <span className="text-gray-500 text-sm">データなし</span>
        )}
      </div>
    </div>
  );
}

function SignaturePanel({ signature }: { signature: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [signature]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-red-600">
        <div>
          <span className="text-sm font-bold text-white">Signature</span>
          <span className="text-xs text-white/70 ml-2">署名</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
        >
          {copied ? "コピー済み!" : "コピー"}
        </button>
      </div>
      <div className="bg-gray-900 p-4">
        <p className="text-sm font-mono text-red-400 break-all">{signature}</p>
      </div>
    </div>
  );
}

function ClaimsTable({ payload }: { payload: Record<string, unknown> }) {
  const rows = Object.entries(payload).map(([key, value]) => {
    const meta = CLAIM_META[key];
    const isTs = meta?.isTimestamp && typeof value === "number";
    return { key, value, meta, isTs };
  });

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800">
          クレーム一覧 <span className="font-normal text-gray-500">(Claims)</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs">
              <th className="text-left px-4 py-2 font-semibold">キー</th>
              <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">名前 (Name)</th>
              <th className="text-left px-4 py-2 font-semibold">値 (Value)</th>
              <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">説明</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, value, meta, isTs }) => (
              <tr key={key} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600 font-semibold">{key}</td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                  {meta ? (
                    <>
                      <span className="text-gray-800">{meta.labelJa}</span>
                      <span className="text-gray-400 text-xs ml-1">({meta.label})</span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">カスタムクレーム</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs max-w-xs">
                  {isTs ? (
                    <div className="space-y-0.5">
                      <div className="text-gray-800">{formatUnixTime(value as number)}</div>
                      <div className="text-gray-400">{String(value)}</div>
                    </div>
                  ) : (
                    <span className="text-gray-800 break-all">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                  {meta?.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpirationBanner({ payload }: { payload: Record<string, unknown> }) {
  const status = getExpirationStatus(payload);
  if (!status) {
    return (
      <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 flex items-center gap-3">
        <span className="text-lg">ℹ️</span>
        <span>有効期限クレーム（exp）が見つかりません。期限なしのトークンです。</span>
      </div>
    );
  }
  if (status.isExpired) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 flex items-center gap-3">
        <span className="text-lg">🚫</span>
        <div>
          <div className="font-bold">有効期限切れ (Expired)</div>
          <div className="text-xs mt-0.5">
            {formatUnixTime(status.exp)} に期限切れ（{formatDuration(Math.abs(status.diff))}前）
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-sm text-green-700 flex items-center gap-3">
      <span className="text-lg">✅</span>
      <div>
        <div className="font-bold">有効なトークン (Valid)</div>
        <div className="text-xs mt-0.5">
          {formatUnixTime(status.exp)} まで有効（残り {formatDuration(status.diff)}）
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main page
// ----------------------------------------------------------------
export default function JwtDecoderPage() {
  const [token, setToken] = useState("");

  const hasInput = token.trim().length > 0;
  const decoded = hasInput ? decodeJWT(token) : null;

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            JWT Decoder
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            JWTトークンをブラウザ上で即時デコード・検証。
            データはサーバーに送信されません — 完全クライアントサイド処理。
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="jwt-input" className="block text-sm font-semibold text-gray-700">
              JWTトークンを貼り付け <span className="font-normal text-gray-400">(Paste your JWT token)</span>
            </label>
            <button
              onClick={() => setToken(SAMPLE_TOKEN)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer underline underline-offset-2"
            >
              サンプルJWTを試す
            </button>
          </div>
          <textarea
            id="jwt-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIi..."
            className="w-full h-32 p-4 rounded-lg bg-gray-50 text-gray-800 font-mono text-sm resize-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300"
            spellCheck={false}
            autoComplete="off"
          />
          {token.trim() && (
            <button
              onClick={() => setToken("")}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              クリア
            </button>
          )}
        </div>

        {/* Color-coded token display */}
        {hasInput && !decoded?.error && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">
              色分け表示 (Color-coded structure)
            </p>
            <TokenColorDisplay token={token} />
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span><span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />Header（ヘッダー）</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1" />Payload（ペイロード）</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />Signature（署名）</span>
            </div>
          </div>
        )}

        {/* Error */}
        {decoded?.error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <span className="font-bold">エラー: </span>{decoded.error}
          </div>
        )}

        {/* Expiration banner */}
        {decoded?.payload && !decoded.error && (
          <ExpirationBanner payload={decoded.payload} />
        )}

        {/* Decoded sections */}
        {decoded && !decoded.error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <JsonPanel
              title="Header"
              titleJa="ヘッダー"
              colorClass="bg-blue-600"
              data={decoded.header}
            />
            <JsonPanel
              title="Payload"
              titleJa="ペイロード"
              colorClass="bg-purple-600"
              data={decoded.payload}
            />
            <SignaturePanel signature={decoded.signature} />
          </div>
        )}

        {/* Claims table */}
        {decoded?.payload && !decoded.error && (
          <ClaimsTable payload={decoded.payload} />
        )}

        {/* Security notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 space-y-2">
          <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <span>⚠️</span>
            セキュリティに関する注意事項 (Security Notes)
          </h3>
          <ul className="text-xs text-amber-700 space-y-1 list-disc pl-5">
            <li>JWTの<strong>署名検証はサーバーサイドで行ってください</strong>。このツールはデコードのみです。</li>
            <li>Payloadは Base64Url エンコードされているだけで<strong>暗号化されていません</strong>。誰でも中身を読めます。</li>
            <li>機密情報（パスワード、クレジットカード番号等）はPayloadに含めないでください。</li>
            <li>本番環境のJWTを信頼できないサイトに貼り付けないでください。このツールはクライアントサイド処理ですが、習慣として重要です。</li>
            <li>適切な有効期限（exp）を設定し、不要になったトークンは無効化してください。</li>
          </ul>
        </div>

        {/* JWT Structure explanation */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900">
            JWTの構造解説 <span className="text-gray-400 font-normal text-base">(JWT Structure)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-bold text-blue-800 text-sm">Header（ヘッダー）</h3>
              </div>
              <p className="text-xs text-blue-700">
                トークンの種類（typ）と署名アルゴリズム（alg）を指定します。
                例: <code className="bg-blue-100 px-1 rounded">HS256</code>（HMAC-SHA256）、
                <code className="bg-blue-100 px-1 rounded">RS256</code>（RSA-SHA256）。
                Base64Url エンコードされています。
              </p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-500" />
                <h3 className="font-bold text-purple-800 text-sm">Payload（ペイロード）</h3>
              </div>
              <p className="text-xs text-purple-700">
                クレーム（claims）と呼ばれるユーザー情報やメタデータを格納します。
                標準クレーム（iss, sub, aud, exp, iat, nbf, jti）とカスタムクレームを含められます。
                <strong>暗号化されていない</strong>点に注意。
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                <h3 className="font-bold text-red-800 text-sm">Signature（署名）</h3>
              </div>
              <p className="text-xs text-red-700">
                Header + Payload を秘密鍵またはキーペアで署名したもの。
                トークンの改ざん検知に使用されます。
                <strong>署名の検証はサーバーサイドでのみ行えます</strong>。
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-gray-900 p-4 text-center">
            <p className="font-mono text-sm">
              <span className="text-blue-400">base64Url(Header)</span>
              <span className="text-gray-500"> . </span>
              <span className="text-purple-400">base64Url(Payload)</span>
              <span className="text-gray-500"> . </span>
              <span className="text-red-400">HMACSHA256(header+payload, secret)</span>
            </p>
          </div>
        </section>

        {/* SEO article */}
        <article className="prose prose-sm max-w-none text-gray-700 space-y-5 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900">JWT (JSON Web Token) とは？</h2>
          <p>
            JWT（JSON Web Token）は RFC 7519 で定義されたオープン標準で、
            当事者間で安全に情報を伝送するためのコンパクトな方式です。
            モダンなWebアプリケーションの認証・認可・情報交換に広く使われています。
            ユーザーがログインするとサーバーがJWTを発行し、クライアントはそれを保存して
            後続のリクエストに付与します。
          </p>
          <h2 className="text-xl font-bold text-gray-900">このJWT Decoderの使い方</h2>
          <p>
            上のテキストエリアにJWTトークンを貼り付けるだけで、
            Header・Payload・Signatureを即座にデコードして表示します。
            処理はすべてブラウザ内で完結し、データはサーバーに送信されません。
            有効期限の自動判定、Unixタイムスタンプの日時変換、
            クレームの日本語説明も含めて確認できます。
          </p>
        </article>

        {/* Ad placeholder */}
        <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 text-xs">
          Advertisement
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-10">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JWT Decoder — 無料オンラインツール。登録不要。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">関連ツール (Related Tools)</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="/hash-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
              <a href="/url-encoder" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">URL Encoder</a>
              <a href="/epoch-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JWT Decoder",
  "description": "JWTトークンをブラウザ上で即時デコード・検証。\n            データはサーバーに送信されません — 完全クライアントサイド処理。",
  "url": "https://tools.loresync.dev/jwt-decoder",
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
      </footer>
    </main>
  );
}
