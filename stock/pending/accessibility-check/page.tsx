"use client";
import AccessibilityCheck from "./components/AccessibilityCheck";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">ツール一覧</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Accessibility Checker</span>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Accessibility Checker</h1>
          <p className="text-gray-500 mb-8">Paste HTML code to detect accessibility issues without a URL</p>
          <AccessibilityCheck />
        </div>
      </div>
    </div>
  );
}
