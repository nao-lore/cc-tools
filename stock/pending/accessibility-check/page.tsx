"use client";
import AccessibilityCheck from "./components/AccessibilityCheck";
export default function AccessibilityCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HTML Accessibility Checker</h1>
        <p className="text-gray-600 mb-8">Paste HTML code to instantly detect accessibility issues — no URL needed</p>
        <AccessibilityCheck />
      </div>
    </div>
  );
}
