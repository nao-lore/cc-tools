"use client";
import ChoJyuIwai from "./components/ChoJyuIwai";
export default function ChoJyuIwaiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">長寿祝い 一覧・年齢早見表</h1>
        <p className="text-gray-600 mb-8">還暦から百寿まで、年齢・名称・テーマカラーを一覧表示。生年から該当する長寿祝いを自動判定します。</p>
        <ChoJyuIwai />
      </div>
    </div>
  );
}
