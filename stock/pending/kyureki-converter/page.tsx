"use client";
import KyurekiConverter from "./components/KyurekiConverter";

export default function KyurekiConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">旧暦 ↔ 新暦 変換</h1>
        <p className="text-gray-600 mb-8">日付を入力して旧暦・新暦を相互変換。干支・六曜・和暦も同時表示。</p>
        <KyurekiConverter />
      </div>
    </div>
  );
}
