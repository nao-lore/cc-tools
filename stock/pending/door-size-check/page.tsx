"use client";
import DoorSizeCheck from "./components/DoorSizeCheck";
export default function DoorSizeCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">搬入ドアサイズ チェッカー</h1>
        <p className="text-gray-600 mb-8">家具サイズと搬入経路（ドア・廊下）の通過可否を判定</p>
        <DoorSizeCheck />
      </div>
    </div>
  );
}
