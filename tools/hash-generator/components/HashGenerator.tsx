'use client';

import { useState, useCallback, useRef } from 'react';
import { computeAllHashes, type HashResult } from '../lib/hash';

export default function HashGenerator() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<HashResult[]>([]);
  const [fileResults, setFileResults] = useState<HashResult[]>([]);
  const [fileName, setFileName] = useState('');
  const [computing, setComputing] = useState(false);
  const [computingFile, setComputingFile] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFromText = useCallback(async () => {
    if (!text.trim()) return;
    setComputing(true);
    try {
      const data = new TextEncoder().encode(text);
      const hashes = await computeAllHashes(data);
      setResults(hashes);
    } finally {
      setComputing(false);
    }
  }, [text]);

  const processFile = useCallback(async (file: File) => {
    setComputingFile(true);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const data = new Uint8Array(buf);
      const hashes = await computeAllHashes(data);
      setFileResults(hashes);
    } finally {
      setComputingFile(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const copyHash = useCallback(async (hash: string) => {
    const val = uppercase ? hash.toUpperCase() : hash;
    await navigator.clipboard.writeText(val);
    setCopied(hash);
    setTimeout(() => setCopied(null), 1500);
  }, [uppercase]);

  const formatHash = (h: string) => (uppercase ? h.toUpperCase() : h);

  const compareMatch =
    compareA.trim() !== '' &&
    compareB.trim() !== '' &&
    compareA.trim().toLowerCase() === compareB.trim().toLowerCase();
  const compareMismatch =
    compareA.trim() !== '' &&
    compareB.trim() !== '' &&
    compareA.trim().toLowerCase() !== compareB.trim().toLowerCase();

  return (
    <div className="space-y-10">
      {/* Text Hash Section */}
      <section className="rounded-xl border border-card-border bg-card-bg p-6">
        <h2 className="text-lg font-semibold text-accent mb-4">Text Hash</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to hash..."
          rows={5}
          className="w-full rounded-lg border border-card-border bg-background p-4 font-mono text-sm text-foreground resize-y focus:border-accent"
        />
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={generateFromText}
            disabled={computing || !text.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {computing ? 'Computing...' : 'Generate Hashes'}
          </button>
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="accent-accent"
            />
            Uppercase
          </label>
        </div>
        {results.length > 0 && (
          <HashTable results={results} formatHash={formatHash} copyHash={copyHash} copied={copied} />
        )}
      </section>

      {/* File Hash Section */}
      <section className="rounded-xl border border-card-border bg-card-bg p-6">
        <h2 className="text-lg font-semibold text-accent mb-4">File Hash</h2>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition ${
            dragOver
              ? 'border-accent bg-accent/5'
              : 'border-card-border hover:border-muted'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-muted text-sm">
            {computingFile
              ? 'Computing hashes...'
              : 'Drag & drop a file here, or click to select'}
          </p>
          {fileName && !computingFile && (
            <p className="mt-2 text-xs text-accent font-mono">{fileName}</p>
          )}
        </div>
        {fileResults.length > 0 && (
          <HashTable results={fileResults} formatHash={formatHash} copyHash={copyHash} copied={copied} />
        )}
      </section>

      {/* Hash Comparison Section */}
      <section className="rounded-xl border border-card-border bg-card-bg p-6">
        <h2 className="text-lg font-semibold text-accent mb-4">Hash Comparison</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={compareA}
            onChange={(e) => setCompareA(e.target.value)}
            placeholder="Paste first hash..."
            className="rounded-lg border border-card-border bg-background p-3 font-mono text-sm text-foreground"
          />
          <input
            value={compareB}
            onChange={(e) => setCompareB(e.target.value)}
            placeholder="Paste second hash..."
            className="rounded-lg border border-card-border bg-background p-3 font-mono text-sm text-foreground"
          />
        </div>
        {compareMatch && (
          <p className="mt-3 flex items-center gap-2 text-success text-sm font-semibold">
            <span>&#10003;</span> Hashes match
          </p>
        )}
        {compareMismatch && (
          <p className="mt-3 flex items-center gap-2 text-error text-sm font-semibold">
            <span>&#10007;</span> Hashes do not match
          </p>
        )}
      </section>
    </div>
  );
}

function HashTable({
  results,
  formatHash,
  copyHash,
  copied,
}: {
  results: HashResult[];
  formatHash: (h: string) => string;
  copyHash: (h: string) => void;
  copied: string | null;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-card-border text-muted">
            <th className="pb-2 pr-4 font-medium">Algorithm</th>
            <th className="pb-2 pr-4 font-medium">Hash</th>
            <th className="pb-2 font-medium w-16">Copy</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.algorithm} className="border-b border-card-border/50">
              <td className="py-3 pr-4 font-semibold text-accent whitespace-nowrap">
                {r.algorithm}
              </td>
              <td className="py-3 pr-4 font-mono text-xs break-all">
                {formatHash(r.hash)}
              </td>
              <td className="py-3">
                <button
                  onClick={() => copyHash(r.hash)}
                  className="rounded px-2 py-1 text-xs text-muted hover:text-accent transition"
                  title={`Copy ${r.algorithm} hash`}
                >
                  {copied === r.hash ? 'Copied!' : 'Copy'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
