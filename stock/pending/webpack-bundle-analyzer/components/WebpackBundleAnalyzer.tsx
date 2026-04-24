"use client";

import { useState, useMemo } from "react";

type PackageData = {
  name: string;
  minKB: number;
  gzipKB: number;
};

const DB: PackageData[] = [
  { name: "react", minKB: 6.4, gzipKB: 2.5 },
  { name: "react-dom", minKB: 130, gzipKB: 42 },
  { name: "react-dom/client", minKB: 130, gzipKB: 42 },
  { name: "lodash", minKB: 72, gzipKB: 25 },
  { name: "axios", minKB: 13, gzipKB: 5 },
  { name: "moment", minKB: 67, gzipKB: 17 },
  { name: "date-fns", minKB: 14, gzipKB: 5 },
  { name: "d3", minKB: 249, gzipKB: 84 },
  { name: "three", minKB: 600, gzipKB: 150 },
  { name: "jquery", minKB: 87, gzipKB: 30 },
  { name: "vue", minKB: 143, gzipKB: 51 },
  { name: "angular", minKB: 62, gzipKB: 18 },
  { name: "@angular/core", minKB: 395, gzipKB: 110 },
  { name: "typescript", minKB: 10100, gzipKB: 2200 },
  { name: "webpack", minKB: 5200, gzipKB: 1400 },
  { name: "babel-core", minKB: 1800, gzipKB: 460 },
  { name: "@babel/core", minKB: 1800, gzipKB: 460 },
  { name: "redux", minKB: 7.6, gzipKB: 2.9 },
  { name: "react-redux", minKB: 36, gzipKB: 11 },
  { name: "@reduxjs/toolkit", minKB: 37, gzipKB: 12 },
  { name: "mobx", minKB: 60, gzipKB: 18 },
  { name: "zustand", minKB: 3.2, gzipKB: 1.4 },
  { name: "jotai", minKB: 8.4, gzipKB: 3.1 },
  { name: "recoil", minKB: 43, gzipKB: 14 },
  { name: "xstate", minKB: 33, gzipKB: 10 },
  { name: "react-router", minKB: 24, gzipKB: 8.1 },
  { name: "react-router-dom", minKB: 26, gzipKB: 8.8 },
  { name: "next", minKB: 82, gzipKB: 24 },
  { name: "gatsby", minKB: 210, gzipKB: 60 },
  { name: "vite", minKB: 390, gzipKB: 110 },
  { name: "rollup", minKB: 940, gzipKB: 250 },
  { name: "esbuild", minKB: 11000, gzipKB: 3200 },
  { name: "tailwindcss", minKB: 3600, gzipKB: 780 },
  { name: "styled-components", minKB: 36, gzipKB: 12 },
  { name: "@emotion/react", minKB: 34, gzipKB: 11 },
  { name: "@emotion/styled", minKB: 13, gzipKB: 4.4 },
  { name: "sass", minKB: 2100, gzipKB: 560 },
  { name: "postcss", minKB: 63, gzipKB: 18 },
  { name: "autoprefixer", minKB: 88, gzipKB: 23 },
  { name: "graphql", minKB: 85, gzipKB: 22 },
  { name: "@apollo/client", minKB: 180, gzipKB: 55 },
  { name: "urql", minKB: 25, gzipKB: 8.5 },
  { name: "swr", minKB: 8.3, gzipKB: 3.1 },
  { name: "@tanstack/react-query", minKB: 41, gzipKB: 13 },
  { name: "react-query", minKB: 41, gzipKB: 13 },
  { name: "socket.io-client", minKB: 42, gzipKB: 14 },
  { name: "socket.io", minKB: 310, gzipKB: 85 },
  { name: "express", minKB: 210, gzipKB: 58 },
  { name: "fastify", minKB: 230, gzipKB: 64 },
  { name: "koa", minKB: 35, gzipKB: 12 },
  { name: "zod", minKB: 55, gzipKB: 14 },
  { name: "yup", minKB: 42, gzipKB: 13 },
  { name: "joi", minKB: 148, gzipKB: 44 },
  { name: "ajv", minKB: 120, gzipKB: 37 },
  { name: "classnames", minKB: 0.9, gzipKB: 0.4 },
  { name: "clsx", minKB: 0.7, gzipKB: 0.35 },
  { name: "uuid", minKB: 8.7, gzipKB: 3.4 },
  { name: "nanoid", minKB: 1.1, gzipKB: 0.6 },
  { name: "lodash-es", minKB: 71, gzipKB: 24 },
  { name: "ramda", minKB: 48, gzipKB: 13 },
  { name: "immer", minKB: 16, gzipKB: 5.9 },
  { name: "rxjs", minKB: 220, gzipKB: 56 },
  { name: "chart.js", minKB: 193, gzipKB: 62 },
  { name: "recharts", minKB: 253, gzipKB: 80 },
  { name: "victory", minKB: 220, gzipKB: 70 },
  { name: "apexcharts", minKB: 410, gzipKB: 130 },
  { name: "highcharts", minKB: 390, gzipKB: 120 },
  { name: "echarts", minKB: 980, gzipKB: 290 },
  { name: "antd", minKB: 1540, gzipKB: 410 },
  { name: "@mui/material", minKB: 1820, gzipKB: 480 },
  { name: "@chakra-ui/react", minKB: 310, gzipKB: 94 },
  { name: "react-bootstrap", minKB: 131, gzipKB: 44 },
  { name: "bootstrap", minKB: 160, gzipKB: 23 },
  { name: "@headlessui/react", minKB: 32, gzipKB: 11 },
  { name: "radix-ui", minKB: 42, gzipKB: 14 },
  { name: "framer-motion", minKB: 108, gzipKB: 35 },
  { name: "react-spring", minKB: 51, gzipKB: 16 },
  { name: "gsap", minKB: 116, gzipKB: 34 },
  { name: "anime", minKB: 17, gzipKB: 6.3 },
  { name: "dayjs", minKB: 6.9, gzipKB: 2.8 },
  { name: "luxon", minKB: 68, gzipKB: 22 },
  { name: "i18next", minKB: 31, gzipKB: 10 },
  { name: "react-i18next", minKB: 17, gzipKB: 5.8 },
  { name: "marked", minKB: 24, gzipKB: 8.2 },
  { name: "markdown-it", minKB: 52, gzipKB: 18 },
  { name: "react-markdown", minKB: 10, gzipKB: 3.7 },
  { name: "prismjs", minKB: 30, gzipKB: 9.4 },
  { name: "highlight.js", minKB: 1040, gzipKB: 340 },
  { name: "monaco-editor", minKB: 12800, gzipKB: 3400 },
  { name: "codemirror", minKB: 640, gzipKB: 190 },
  { name: "quill", minKB: 215, gzipKB: 67 },
  { name: "draft-js", minKB: 154, gzipKB: 46 },
  { name: "slate", minKB: 42, gzipKB: 14 },
  { name: "react-hook-form", minKB: 9.1, gzipKB: 3.5 },
  { name: "formik", minKB: 43, gzipKB: 14 },
  { name: "react-final-form", minKB: 18, gzipKB: 6.1 },
  { name: "react-table", minKB: 14, gzipKB: 5.1 },
  { name: "@tanstack/react-table", minKB: 50, gzipKB: 16 },
  { name: "react-virtualized", minKB: 94, gzipKB: 28 },
  { name: "react-window", minKB: 13, gzipKB: 4.9 },
  { name: "react-dnd", minKB: 29, gzipKB: 9.8 },
  { name: "@dnd-kit/core", minKB: 30, gzipKB: 10 },
  { name: "react-beautiful-dnd", minKB: 51, gzipKB: 16 },
  { name: "react-select", minKB: 78, gzipKB: 26 },
  { name: "downshift", minKB: 32, gzipKB: 11 },
  { name: "react-datepicker", minKB: 55, gzipKB: 18 },
  { name: "flatpickr", minKB: 61, gzipKB: 16 },
  { name: "fullcalendar", minKB: 310, gzipKB: 90 },
  { name: "leaflet", minKB: 140, gzipKB: 41 },
  { name: "mapbox-gl", minKB: 780, gzipKB: 220 },
  { name: "react-map-gl", minKB: 43, gzipKB: 14 },
  { name: "pixi.js", minKB: 820, gzipKB: 230 },
  { name: "fabric", minKB: 305, gzipKB: 88 },
  { name: "konva", minKB: 145, gzipKB: 42 },
  { name: "crypto-js", minKB: 115, gzipKB: 33 },
  { name: "forge", minKB: 530, gzipKB: 150 },
  { name: "bcryptjs", minKB: 44, gzipKB: 14 },
  { name: "jwt-decode", minKB: 2.7, gzipKB: 1.1 },
  { name: "jsonwebtoken", minKB: 78, gzipKB: 24 },
  { name: "qs", minKB: 14, gzipKB: 5.3 },
  { name: "query-string", minKB: 6.5, gzipKB: 2.5 },
  { name: "cross-fetch", minKB: 5.8, gzipKB: 2.2 },
  { name: "node-fetch", minKB: 28, gzipKB: 9.3 },
  { name: "superagent", minKB: 58, gzipKB: 20 },
  { name: "got", minKB: 74, gzipKB: 24 },
  { name: "cheerio", minKB: 282, gzipKB: 82 },
  { name: "puppeteer", minKB: 4800, gzipKB: 1200 },
  { name: "playwright", minKB: 6200, gzipKB: 1600 },
  { name: "jest", minKB: 1400, gzipKB: 380 },
  { name: "vitest", minKB: 1100, gzipKB: 300 },
  { name: "mocha", minKB: 590, gzipKB: 160 },
  { name: "chai", minKB: 112, gzipKB: 34 },
  { name: "sinon", minKB: 460, gzipKB: 130 },
  { name: "@testing-library/react", minKB: 37, gzipKB: 12 },
  { name: "@testing-library/dom", minKB: 95, gzipKB: 30 },
  { name: "cypress", minKB: 51000, gzipKB: 13000 },
  { name: "dotenv", minKB: 5.2, gzipKB: 2.1 },
  { name: "cross-env", minKB: 5.6, gzipKB: 2.3 },
  { name: "concurrently", minKB: 86, gzipKB: 26 },
  { name: "nodemon", minKB: 210, gzipKB: 58 },
  { name: "ts-node", minKB: 1600, gzipKB: 420 },
  { name: "eslint", minKB: 3200, gzipKB: 830 },
  { name: "prettier", minKB: 5800, gzipKB: 1500 },
  { name: "husky", minKB: 59, gzipKB: 18 },
  { name: "lint-staged", minKB: 240, gzipKB: 66 },
  { name: "ora", minKB: 28, gzipKB: 9.2 },
  { name: "chalk", minKB: 9.7, gzipKB: 3.8 },
  { name: "commander", minKB: 22, gzipKB: 7.5 },
  { name: "yargs", minKB: 87, gzipKB: 26 },
  { name: "minimist", minKB: 5.0, gzipKB: 2.0 },
  { name: "glob", minKB: 46, gzipKB: 15 },
  { name: "fs-extra", minKB: 48, gzipKB: 15 },
  { name: "mkdirp", minKB: 6.7, gzipKB: 2.8 },
  { name: "rimraf", minKB: 14, gzipKB: 5.1 },
  { name: "chokidar", minKB: 71, gzipKB: 22 },
  { name: "sharp", minKB: 360, gzipKB: 96 },
  { name: "jimp", minKB: 680, gzipKB: 190 },
  { name: "pdfkit", minKB: 2200, gzipKB: 620 },
  { name: "exceljs", minKB: 1800, gzipKB: 490 },
  { name: "papaparse", minKB: 51, gzipKB: 16 },
  { name: "xlsx", minKB: 1100, gzipKB: 290 },
  { name: "mongoose", minKB: 2100, gzipKB: 570 },
  { name: "sequelize", minKB: 2900, gzipKB: 770 },
  { name: "prisma", minKB: 1500, gzipKB: 400 },
  { name: "@prisma/client", minKB: 280, gzipKB: 76 },
  { name: "typeorm", minKB: 3200, gzipKB: 840 },
  { name: "knex", minKB: 1100, gzipKB: 290 },
  { name: "pg", minKB: 420, gzipKB: 120 },
  { name: "mysql2", minKB: 480, gzipKB: 130 },
  { name: "sqlite3", minKB: 1200, gzipKB: 310 },
  { name: "redis", minKB: 240, gzipKB: 68 },
  { name: "ioredis", minKB: 380, gzipKB: 105 },
  { name: "bull", minKB: 420, gzipKB: 115 },
  { name: "amqplib", minKB: 280, gzipKB: 78 },
  { name: "stripe", minKB: 530, gzipKB: 145 },
  { name: "twilio", minKB: 3100, gzipKB: 820 },
  { name: "nodemailer", minKB: 390, gzipKB: 108 },
  { name: "aws-sdk", minKB: 81000, gzipKB: 21000 },
  { name: "@aws-sdk/client-s3", minKB: 2800, gzipKB: 740 },
  { name: "firebase", minKB: 1100, gzipKB: 290 },
  { name: "firebase-admin", minKB: 3800, gzipKB: 1000 },
  { name: "@google-cloud/storage", minKB: 2100, gzipKB: 560 },
  { name: "passport", minKB: 56, gzipKB: 18 },
  { name: "helmet", minKB: 28, gzipKB: 9.4 },
  { name: "cors", minKB: 6.8, gzipKB: 2.7 },
  { name: "compression", minKB: 20, gzipKB: 7.2 },
  { name: "morgan", minKB: 15, gzipKB: 5.5 },
  { name: "winston", minKB: 240, gzipKB: 68 },
  { name: "pino", minKB: 110, gzipKB: 34 },
  { name: "body-parser", minKB: 14, gzipKB: 5.3 },
  { name: "multer", minKB: 32, gzipKB: 11 },
  { name: "busboy", minKB: 36, gzipKB: 12 },
  { name: "ws", minKB: 38, gzipKB: 13 },
  { name: "p-limit", minKB: 2.0, gzipKB: 0.9 },
  { name: "p-queue", minKB: 7.5, gzipKB: 2.9 },
  { name: "bottleneck", minKB: 25, gzipKB: 8.7 },
  { name: "async", minKB: 34, gzipKB: 11 },
  { name: "bluebird", minKB: 71, gzipKB: 23 },
  { name: "numeral", minKB: 16, gzipKB: 6.0 },
  { name: "accounting", minKB: 6.1, gzipKB: 2.4 },
  { name: "currency.js", minKB: 3.8, gzipKB: 1.6 },
  { name: "decimal.js", minKB: 32, gzipKB: 11 },
  { name: "big.js", minKB: 9.4, gzipKB: 3.6 },
  { name: "validator", minKB: 54, gzipKB: 18 },
  { name: "dompurify", minKB: 20, gzipKB: 7.4 },
  { name: "xss", minKB: 24, gzipKB: 8.2 },
  { name: "he", minKB: 11, gzipKB: 4.1 },
  { name: "entities", minKB: 24, gzipKB: 8.5 },
  { name: "showdown", minKB: 72, gzipKB: 22 },
  { name: "turndown", minKB: 22, gzipKB: 7.8 },
  { name: "diff", minKB: 20, gzipKB: 7.1 },
  { name: "deep-diff", minKB: 7.4, gzipKB: 2.9 },
  { name: "fast-deep-equal", minKB: 0.8, gzipKB: 0.4 },
  { name: "lodash.merge", minKB: 6.8, gzipKB: 2.7 },
  { name: "merge", minKB: 2.9, gzipKB: 1.2 },
  { name: "deepmerge", minKB: 2.4, gzipKB: 1.0 },
  { name: "object-assign", minKB: 0.5, gzipKB: 0.3 },
  { name: "tslib", minKB: 9.8, gzipKB: 3.7 },
  { name: "core-js", minKB: 1200, gzipKB: 320 },
  { name: "regenerator-runtime", minKB: 15, gzipKB: 5.6 },
  { name: "whatwg-fetch", minKB: 5.4, gzipKB: 2.1 },
  { name: "unfetch", minKB: 1.2, gzipKB: 0.6 },
];

const DB_MAP = new Map<string, PackageData>(DB.map((p) => [p.name, p]));

type ResultRow = PackageData & { found: true } | { name: string; found: false };

function formatKB(kb: number): string {
  if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`;
  return `${kb % 1 === 0 ? kb : kb.toFixed(1)} KB`;
}

function loadTimeSeconds(kb: number, kbps: number): string {
  const secs = (kb * 8) / kbps;
  if (secs < 0.1) return "<0.1s";
  if (secs >= 10) return `${secs.toFixed(0)}s`;
  return `${secs.toFixed(1)}s`;
}

const MAX_BAR_WIDTH = 280; // px reference for bar chart

export default function WebpackBundleAnalyzer() {
  const [input, setInput] = useState("");

  const results = useMemo<ResultRow[]>(() => {
    const lines = input
      .split("\n")
      .map((l) => l.trim().replace(/^['"@]?/, "").replace(/['",].*$/, "").trim())
      .filter(Boolean);

    const seen = new Set<string>();
    const out: ResultRow[] = [];
    for (const raw of lines) {
      // normalise: strip version specifiers like @1.2.3
      const name = raw.replace(/@[\^~]?\d.*$/, "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const entry = DB_MAP.get(name);
      if (entry) {
        out.push({ ...entry, found: true });
      } else {
        out.push({ name, found: false });
      }
    }
    return out;
  }, [input]);

  const found = results.filter((r): r is PackageData & { found: true } => r.found);
  const notFound = results.filter((r) => !r.found);

  const totalMin = found.reduce((s, r) => s + r.minKB, 0);
  const totalGzip = found.reduce((s, r) => s + r.gzipKB, 0);

  // 3G = 750 kbps, LTE = 10 Mbps = 10240 kbps
  const time3G = loadTimeSeconds(totalGzip, 750);
  const timeLTE = loadTimeSeconds(totalGzip, 10240);

  const hasInput = input.trim().length > 0;

  const maxMin = found.length > 0 ? Math.max(...found.map((r) => r.minKB)) : 1;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">Package Names</span>
          <div className="flex gap-2">
            {hasInput && (
              <button
                onClick={() => setInput("")}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() =>
                setInput(
                  "react\nreact-dom\naxios\nlodash\ndate-fns\nreact-router-dom\nzustand\nreact-hook-form\nzod\nframer-motion"
                )
              }
              className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Load Sample
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Enter one package name per line:\n\nreact\nreact-dom\naxios\nlodash\n..."}
          className="w-full h-44 px-4 py-3 font-mono text-sm text-gray-800 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          spellCheck={false}
        />
      </div>

      {/* Summary cards */}
      {hasInput && found.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{found.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Packages Found</div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-xl px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{formatKB(totalMin)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Minified</div>
          </div>
          <div className="bg-white border border-green-200 rounded-xl px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{formatKB(totalGzip)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Gzipped</div>
          </div>
          <div className={`border rounded-xl px-4 py-3 text-center shadow-sm ${totalGzip > 500 ? "bg-red-50 border-red-200" : totalGzip > 200 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
            <div className={`text-2xl font-bold ${totalGzip > 500 ? "text-red-600" : totalGzip > 200 ? "text-amber-600" : "text-green-600"}`}>
              {totalGzip > 500 ? "Heavy" : totalGzip > 200 ? "Moderate" : "Light"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Bundle Weight</div>
          </div>
        </div>
      )}

      {/* Load time */}
      {hasInput && found.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Estimated Load Time (gzipped transfer)</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="px-6 py-4 text-center">
              <div className="text-3xl font-bold text-orange-500">{time3G}</div>
              <div className="text-xs text-gray-500 mt-1">3G (750 kbps)</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-3xl font-bold text-blue-500">{timeLTE}</div>
              <div className="text-xs text-gray-500 mt-1">LTE (10 Mbps)</div>
            </div>
          </div>
        </div>
      )}

      {/* Results table */}
      {hasInput && results.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Results</span>
            <span className="text-xs text-gray-400">({results.length} packages)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Package</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Minified</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Gzipped</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 hidden sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) =>
                  row.found ? (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 font-mono text-xs text-gray-800 font-medium">{row.name}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs text-indigo-700">{formatKB(row.minKB)}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs text-green-700">{formatKB(row.gzipKB)}</td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">found</span>
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx} className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-gray-400 font-medium">{row.name}</td>
                      <td className="px-4 py-2 text-right text-xs text-gray-300">—</td>
                      <td className="px-4 py-2 text-right text-xs text-gray-300">—</td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">not in database</span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
              {found.length > 1 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                    <td className="px-4 py-2 text-xs text-gray-700">Total ({found.length} packages)</td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-indigo-700">{formatKB(totalMin)}</td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-green-700">{formatKB(totalGzip)}</td>
                    <td className="px-4 py-2 hidden sm:table-cell" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Bar chart */}
      {hasInput && found.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Size Breakdown (minified)</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {[...found]
              .sort((a, b) => b.minKB - a.minKB)
              .map((row) => {
                const pct = Math.max(2, (row.minKB / maxMin) * 100);
                return (
                  <div key={row.name} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-600 w-36 truncate flex-shrink-0">{row.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="h-4 rounded bg-indigo-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatKB(row.minKB)}</span>
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Module Size Estimator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Estimate how much a list of npm packages adds to a bundle. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Module Size Estimator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Estimate how much a list of npm packages adds to a bundle. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Not found list */}
      {hasInput && notFound.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Not in database ({notFound.length})</p>
          <p className="text-xs text-amber-600">
            {notFound.map((r) => r.name).join(", ")}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!hasInput && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Enter package names above (one per line) or click <strong>Load Sample</strong> to try it out.
        </div>
      )}

      {/* Ad placeholder */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center h-24 text-gray-300 text-sm">
        Advertisement
      </div>
    </div>
  );
}
