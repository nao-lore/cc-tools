"use client";
import IpaPhonetic from "./components/IpaPhonetic";
export default function IpaPhoneticPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IPA Phonetic Symbol Converter</h1>
        <p className="text-gray-600 mb-8">Convert English text to IPA phonetic notation instantly</p>
        <IpaPhonetic />
      </div>
    </div>
  );
}
