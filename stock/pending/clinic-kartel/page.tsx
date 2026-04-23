"use client";
import ClinicKartel from "./components/ClinicKartel";
export default function ClinicKartelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">クリニック向け電子カルテ 料金・機能比較</h1>
        <p className="text-gray-600 mb-8">主要電子カルテシステムの初期費用・月額・機能を横断比較します</p>
        <ClinicKartel />
      </div>
    </div>
  );
}
