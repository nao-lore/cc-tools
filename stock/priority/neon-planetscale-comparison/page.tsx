"use client";
import NeonPlanetscaleComparison from "./components/NeonPlanetscaleComparison";

export default function NeonPlanetscaleComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          サーバーレスDB 料金比較
        </h1>
        <p className="text-gray-600 mb-8">
          Neon (Postgres) / PlanetScale (MySQL) / Turso (SQLite) の料金・機能を横断比較
        </p>
        <NeonPlanetscaleComparison />
      </div>
    </div>
  );
}
