"use client";
import TwilioSmsCost from "./components/TwilioSmsCost";
export default function TwilioSmsCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Twilio SMS 料金試算ツール</h1>
        <p className="text-gray-600 mb-8">国別SMS単価と月間送信数から月額コストを試算</p>
        <TwilioSmsCost />
      </div>
    </div>
  );
}
