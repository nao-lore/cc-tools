"use client";

import { ClaimInfo } from "../lib/jwt";

function formatValue(value: unknown): string {
  if (typeof value === "number") {
    if (value > 1_000_000_000 && value < 10_000_000_000) {
      return `${value} (${new Date(value * 1000).toISOString()})`;
    }
    return String(value);
  }
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export default function ClaimsTable({ claims }: { claims: ClaimInfo[] }) {
  if (claims.length === 0) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div className="px-4 py-2 bg-panel-bg text-panel-text">
        <span className="text-sm font-semibold">Token Claims</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-panel-bg/80 text-panel-text">
              <th className="text-left px-4 py-2 font-medium">Claim</th>
              <th className="text-left px-4 py-2 font-medium">Name</th>
              <th className="text-left px-4 py-2 font-medium">Value</th>
              <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.key} className="border-t border-border hover:bg-accent/5">
                <td className="px-4 py-2 font-mono text-accent font-medium">{claim.key}</td>
                <td className="px-4 py-2 text-muted">{claim.label}</td>
                <td className="px-4 py-2 font-mono text-xs break-all max-w-xs">{formatValue(claim.value)}</td>
                <td className="px-4 py-2 text-muted text-xs hidden sm:table-cell">{claim.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
