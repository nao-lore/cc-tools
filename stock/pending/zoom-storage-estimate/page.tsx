"use client";
import ZoomStorageEstimate from "./components/ZoomStorageEstimate";
export default function ZoomStorageEstimatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">会議録画 容量予測</h1>
        <p className="text-gray-600 mb-8">解像度・録画時間・参加者数・コーデックから録画ファイルのサイズを予測します。</p>
        <ZoomStorageEstimate />
      </div>
    </div>
  );
}
