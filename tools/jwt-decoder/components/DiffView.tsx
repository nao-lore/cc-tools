"use client";

import { useState } from "react";
import { decodeJWT, diffPayloads } from "../lib/jwt";

export default function DiffView() {
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [expanded, setExpanded] = useState(false);

  const decodedA = tokenA.trim() ? decodeJWT(tokenA) : null;
  const decodedB = tokenB.trim() ? decodeJWT(tokenB) : null;

  const diffs =
    decodedA && decodedB
      ? diffPayloads(decodedA.payload, decodedB.payload)
      : [];

  const statusColor = {
    added: "bg-success/15 text-success",
    removed: "bg-danger/15 text-danger",
    changed: "bg-warning/15 text-warning",
    same: "",
  };

  const statusLabel = {
    added: "ADDED",
    removed: "REMOVED",
    changed: "CHANGED",
    same: "SAME",
  };

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card-bg hover:bg-accent/5 transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">&#x2194;</span>
          Payload Diff &mdash; Compare Two Tokens
        </span>
        <span className="text-muted text-xs">{expanded ? "Collapse" : "Expand"}</span>
      </button>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Token A</label>
              <textarea
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value)}
                placeholder="Paste first JWT..."
                className="w-full h-24 p-3 rounded-lg bg-panel-bg text-panel-text font-mono text-xs resize-none border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Token B</label>
              <textarea
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value)}
                placeholder="Paste second JWT..."
                className="w-full h-24 p-3 rounded-lg bg-panel-bg text-panel-text font-mono text-xs resize-none border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {diffs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-panel-bg/80 text-panel-text">
                    <th className="text-left px-3 py-2 font-medium">Claim</th>
                    <th className="text-left px-3 py-2 font-medium">Token A</th>
                    <th className="text-left px-3 py-2 font-medium">Token B</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.map((d) => (
                    <tr key={d.key} className={`border-t border-border ${statusColor[d.status]}`}>
                      <td className="px-3 py-2 font-mono font-medium">{d.key}</td>
                      <td className="px-3 py-2 font-mono text-xs break-all max-w-[200px]">
                        {d.left !== undefined ? JSON.stringify(d.left) : "\u2014"}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs break-all max-w-[200px]">
                        {d.right !== undefined ? JSON.stringify(d.right) : "\u2014"}
                      </td>
                      <td className="px-3 py-2 text-xs font-semibold">{statusLabel[d.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tokenA.trim() && tokenB.trim() && diffs.length === 0 && decodedA?.error && (
            <p className="text-danger text-sm">Token A: {decodedA.error}</p>
          )}
          {tokenA.trim() && tokenB.trim() && diffs.length === 0 && decodedB?.error && (
            <p className="text-danger text-sm">Token B: {decodedB.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
