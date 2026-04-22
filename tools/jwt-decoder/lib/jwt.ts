export interface DecodedJWT {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  raw: { header: string; payload: string; signature: string };
  error?: string;
}

export interface ExpirationInfo {
  isExpired: boolean;
  label: string;
  exp: number | null;
  iat: number | null;
}

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

export function decodeJWT(token: string): DecodedJWT {
  const trimmed = token.trim();
  const parts = trimmed.split(".");

  if (parts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: "",
      raw: { header: "", payload: "", signature: "" },
      error: "Invalid JWT: expected 3 parts separated by dots, got " + parts.length,
    };
  }

  let header: Record<string, unknown> | null = null;
  let payload: Record<string, unknown> | null = null;
  let error: string | undefined;

  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
  } catch {
    error = "Failed to decode header";
  }

  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    error = (error ? error + "; " : "") + "Failed to decode payload";
  }

  return {
    header,
    payload,
    signature: parts[2],
    raw: { header: parts[0], payload: parts[1], signature: parts[2] },
    error,
  };
}

export function getExpirationInfo(payload: Record<string, unknown> | null): ExpirationInfo {
  if (!payload || typeof payload.exp !== "number") {
    return { isExpired: false, label: "No expiration claim (exp) found", exp: null, iat: null };
  }

  const exp = payload.exp;
  const iat = typeof payload.iat === "number" ? payload.iat : null;
  const now = Math.floor(Date.now() / 1000);
  const diff = exp - now;

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return {
      isExpired: true,
      label: `EXPIRED ${formatDuration(absDiff)} ago`,
      exp,
      iat,
    };
  }

  return {
    isExpired: false,
    label: `Expires in ${formatDuration(diff)}`,
    exp,
    iat,
  };
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export interface ClaimInfo {
  key: string;
  label: string;
  value: unknown;
  description: string;
}

const STANDARD_CLAIMS: Record<string, { label: string; description: string }> = {
  iss: { label: "Issuer", description: "Who issued this token" },
  sub: { label: "Subject", description: "Who this token is about" },
  aud: { label: "Audience", description: "Who this token is intended for" },
  exp: { label: "Expiration Time", description: "When this token expires (Unix timestamp)" },
  iat: { label: "Issued At", description: "When this token was issued (Unix timestamp)" },
  nbf: { label: "Not Before", description: "Token not valid before this time (Unix timestamp)" },
  jti: { label: "JWT ID", description: "Unique identifier for this token" },
};

export function extractClaims(payload: Record<string, unknown> | null): ClaimInfo[] {
  if (!payload) return [];

  const claims: ClaimInfo[] = [];

  for (const [key, meta] of Object.entries(STANDARD_CLAIMS)) {
    if (key in payload) {
      claims.push({
        key,
        label: meta.label,
        value: payload[key],
        description: meta.description,
      });
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    if (!(key in STANDARD_CLAIMS)) {
      claims.push({
        key,
        label: key,
        value,
        description: "Custom claim",
      });
    }
  }

  return claims;
}

export function diffPayloads(
  a: Record<string, unknown> | null,
  b: Record<string, unknown> | null
): { key: string; left: unknown; right: unknown; status: "added" | "removed" | "changed" | "same" }[] {
  if (!a || !b) return [];

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const results: { key: string; left: unknown; right: unknown; status: "added" | "removed" | "changed" | "same" }[] = [];

  for (const key of allKeys) {
    const inA = key in a;
    const inB = key in b;

    if (inA && !inB) {
      results.push({ key, left: a[key], right: undefined, status: "removed" });
    } else if (!inA && inB) {
      results.push({ key, left: undefined, right: b[key], status: "added" });
    } else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
      results.push({ key, left: a[key], right: b[key], status: "changed" });
    } else {
      results.push({ key, left: a[key], right: b[key], status: "same" });
    }
  }

  return results;
}
