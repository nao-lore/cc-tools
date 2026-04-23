"use client";
import CloudflareWorkersCost from "./components/CloudflareWorkersCost";

export default function CloudflareWorkersCostPage() {
  return (
    <div className="min-h-screen bg-[#1B1B1B] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* Cloudflare logo mark */}
            <svg viewBox="0 0 109 41" className="h-7 w-auto" aria-label="Cloudflare" fill="none">
              <path
                d="M77.3 16.7c-.2-.1-.4-.1-.6-.1-.7 0-1.3.4-1.6 1L69 28.3H62l-4.2-8.6c.5-.4.8-1 .8-1.7 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2c0 .8.4 1.5 1 1.9l-4.3 8.4H44l-4.3-8.4c.6-.4 1-1.1 1-1.9 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2c0 .7.3 1.3.8 1.7l-4.2 8.6H26l-6.1-10.7c-.3-.6-.9-1-1.6-1-.2 0-.4 0-.6.1-.9.3-1.4 1.2-1.1 2.1l7 20.3c.2.7.9 1.2 1.7 1.2h54.4c.8 0 1.5-.5 1.7-1.2l7-20.3c.2-.9-.3-1.8-1.1-2.1z"
                fill="#F6821F"
              />
              <path
                d="M78.2 26.5c-.1-.5-.6-.8-1.1-.7l-1.4.3c.2-.6.2-1.2.1-1.8-.4-1.9-2.1-3.3-4.1-3.3-.5 0-1 .1-1.4.3-.6-1.8-2.3-3.1-4.3-3.1-2.5 0-4.5 2-4.5 4.5 0 .1 0 .3.1.4-.2 0-.4-.1-.6-.1-1.7 0-3.1 1.4-3.1 3.1 0 .1 0 .2.1.3H78c.5 0 .9-.4.8-.9l-.6-3z"
                fill="#FBAD41"
              />
            </svg>
            <h1 className="text-2xl font-bold text-white">Cloudflare Workers 料金試算</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Free / Paid プランの月額料金をリクエスト数・CPU時間・KV・R2・D1から試算
          </p>
        </div>
        <CloudflareWorkersCost />
      </div>
    </div>
  );
}
