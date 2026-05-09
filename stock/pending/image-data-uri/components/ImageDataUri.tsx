"use client";

import { useMemo, useState } from "react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageDataUri() {
  const [dataUri, setDataUri] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const size = useMemo(() => new Blob([dataUri]).size, [dataUri]);
  const cssSnippet = dataUri ? `background-image: url("${dataUri}");` : "";
  const htmlSnippet = dataUri ? `<img src="${dataUri}" alt="${fileName || "inline image"}" />` : "";

  function handleFile(file: File | undefined) {
    setCopied(false);
    setError("");
    setDataUri("");
    setFileName("");

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDataUri(String(reader.result || ""));
      setFileName(file.name);
    };
    reader.onerror = () => setError("Could not read the selected file.");
    reader.readAsDataURL(file);
  }

  async function copy(text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-sm font-medium text-cyan-300">Image Tools</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Image Data URI Generator</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Convert small images into inline data URI strings for CSS, HTML, or quick prototypes.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <label className="block text-sm font-medium text-slate-200" htmlFor="image-file">
            Image file
          </label>
          <input
            id="image-file"
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cyan-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950"
          />
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </section>

        {dataUri && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs text-slate-500">File</p>
                <p className="mt-1 break-all text-sm font-semibold">{fileName}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs text-slate-500">Data URI size</p>
                <p className="mt-1 text-sm font-semibold">{formatBytes(size)}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs text-slate-500">Inlining advice</p>
                <p className={`mt-1 text-sm font-semibold ${size > 4096 ? "text-amber-300" : "text-emerald-300"}`}>
                  {size > 4096 ? "Prefer a normal image file" : "Fine for small inline use"}
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Data URI</h2>
                <button
                  type="button"
                  onClick={() => copy(dataUri)}
                  className="rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={dataUri}
                rows={6}
                className="mt-3 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200"
              />
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Snippet title="CSS snippet" value={cssSnippet} onCopy={copy} />
              <Snippet title="HTML snippet" value={htmlSnippet} onCopy={copy} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Snippet({
  title,
  value,
  onCopy,
}: {
  title: string;
  value: string;
  onCopy: (value: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          Copy
        </button>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-200">
        <code>{value}</code>
      </pre>
    </section>
  );
}
