"use client";
import InvoiceQualifiedChecker from "./components/InvoiceQualifiedChecker";

export default function InvoiceQualifiedCheckerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">適格請求書 チェッカー</h1>
        <p className="text-indigo-700 mb-8">インボイス制度の必須記載事項を項目ごとに確認できます</p>
        <InvoiceQualifiedChecker />
      </div>
    </div>
  );
}
