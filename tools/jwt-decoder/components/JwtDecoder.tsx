"use client";

import { useState } from "react";
import { decodeJWT, getExpirationInfo, extractClaims } from "../lib/jwt";
import JsonDisplay from "./JsonDisplay";
import ClaimsTable from "./ClaimsTable";
import DiffView from "./DiffView";

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJhdWQiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSIsImp0aSI6ImFiYzEyMyJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const hasInput = token.trim().length > 0;
  const decoded = hasInput ? decodeJWT(token) : null;
  const expInfo = decoded?.payload ? getExpirationInfo(decoded.payload) : null;
  const claims = decoded?.payload ? extractClaims(decoded.payload) : [];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="jwt-input" className="block text-sm font-medium text-foreground">
            Paste your JWT token
          </label>
          <button
            onClick={() => setToken(SAMPLE_TOKEN)}
            className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
          >
            Try sample token
          </button>
        </div>
        <textarea
          id="jwt-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIi..."
          className="w-full h-32 p-4 rounded-lg bg-panel-bg text-panel-text font-mono text-sm resize-none border border-border focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-panel-text/30"
          spellCheck={false}
          autoComplete="off"
        />
        {token.trim() && (
          <button
            onClick={() => setToken("")}
            className="text-xs text-muted hover:text-danger transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {decoded?.error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
          {decoded.error}
        </div>
      )}

      {/* Expiration Banner */}
      {expInfo && (
        <div
          className={`p-4 rounded-lg border text-sm font-medium flex items-center gap-3 ${
            expInfo.isExpired
              ? "bg-danger/10 border-danger/30 text-danger"
              : expInfo.exp
              ? "bg-success/10 border-success/30 text-success"
              : "bg-panel-bg/50 border-border text-muted"
          }`}
        >
          <span className="text-xl">{expInfo.isExpired ? "\u23F0" : expInfo.exp ? "\u2705" : "\u2139\uFE0F"}</span>
          <div>
            <div className="font-semibold">
              {expInfo.isExpired ? "Is this token expired? Yes!" : expInfo.exp ? "Is this token expired? No" : "Expiration Status"}
            </div>
            <div className="text-xs opacity-80 mt-0.5">{expInfo.label}</div>
            {expInfo.exp && (
              <div className="text-xs opacity-60 mt-0.5">
                Expires: {new Date(expInfo.exp * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decoded Sections */}
      {decoded && !decoded.error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <JsonDisplay title="Header" data={decoded.header} icon="&#x1F4CB;" />
          <JsonDisplay title="Payload" data={decoded.payload} icon="&#x1F4E6;" />
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between px-4 py-2 bg-panel-bg text-panel-text">
              <span className="text-sm font-semibold flex items-center gap-2">
                <span>&#x1F511;</span>
                Signature
              </span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(decoded.signature);
                }}
                className="text-xs px-2 py-1 rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 bg-panel-bg/95 text-panel-text text-sm font-mono overflow-x-auto break-all leading-relaxed">
              <code>{decoded.signature}</code>
            </pre>
            <div className="px-4 py-2 bg-panel-bg/90 border-t border-border">
              <p className="text-xs text-panel-text/60">
                Signature verification requires the secret key or public key, which is not available in the browser.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Claims Table */}
      {claims.length > 0 && <ClaimsTable claims={claims} />}

      {/* Diff View */}
      <DiffView />
    </div>
  );
}
