"use client";

import { useState, useCallback } from "react";

interface PortMapping {
  id: string;
  host: string;
  container: string;
}

interface VolumeMapping {
  id: string;
  host: string;
  container: string;
}

interface EnvVar {
  id: string;
  key: string;
  value: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
      aria-label="Remove"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {children}
    </label>
  );
}

export default function DockerRunGenerator() {
  const [image, setImage] = useState("");
  const [containerName, setContainerName] = useState("");
  const [ports, setPorts] = useState<PortMapping[]>([{ id: uid(), host: "", container: "" }]);
  const [volumes, setVolumes] = useState<VolumeMapping[]>([{ id: uid(), host: "", container: "" }]);
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ id: uid(), key: "", value: "" }]);
  const [network, setNetwork] = useState("bridge");
  const [customNetwork, setCustomNetwork] = useState("");
  const [restart, setRestart] = useState("no");
  const [detached, setDetached] = useState(true);
  const [removeOnExit, setRemoveOnExit] = useState(false);

  // Ports
  const addPort = () => setPorts((p) => [...p, { id: uid(), host: "", container: "" }]);
  const removePort = (id: string) => setPorts((p) => p.filter((x) => x.id !== id));
  const updatePort = (id: string, field: "host" | "container", val: string) =>
    setPorts((p) => p.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  // Volumes
  const addVolume = () => setVolumes((v) => [...v, { id: uid(), host: "", container: "" }]);
  const removeVolume = (id: string) => setVolumes((v) => v.filter((x) => x.id !== id));
  const updateVolume = (id: string, field: "host" | "container", val: string) =>
    setVolumes((v) => v.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  // Env vars
  const addEnv = () => setEnvVars((e) => [...e, { id: uid(), key: "", value: "" }]);
  const removeEnv = (id: string) => setEnvVars((e) => e.filter((x) => x.id !== id));
  const updateEnv = (id: string, field: "key" | "value", val: string) =>
    setEnvVars((e) => e.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  const resolvedNetwork = network === "custom" ? customNetwork : network;

  const dockerRunCommand = (() => {
    if (!image.trim()) return "";
    const parts: string[] = ["docker run"];
    if (detached) parts.push("-d");
    if (removeOnExit) parts.push("--rm");
    if (containerName.trim()) parts.push(`--name ${containerName.trim()}`);
    for (const p of ports) {
      if (p.host && p.container) parts.push(`-p ${p.host}:${p.container}`);
    }
    for (const v of volumes) {
      if (v.host && v.container) parts.push(`-v ${v.host}:${v.container}`);
    }
    for (const e of envVars) {
      if (e.key) {
        parts.push(e.value ? `-e ${e.key}=${e.value}` : `-e ${e.key}`);
      }
    }
    if (resolvedNetwork && resolvedNetwork !== "bridge") parts.push(`--network ${resolvedNetwork}`);
    if (restart !== "no") parts.push(`--restart ${restart}`);
    parts.push(image.trim());
    return parts.join(" \\\n  ");
  })();

  const dockerComposeYaml = (() => {
    if (!image.trim()) return "";
    const lines: string[] = ["services:"];
    const serviceName = (containerName.trim() || image.trim().split(":")[0].split("/").pop() || "app").replace(/[^a-z0-9_-]/gi, "_");
    lines.push(`  ${serviceName}:`);
    lines.push(`    image: ${image.trim()}`);
    if (containerName.trim()) lines.push(`    container_name: ${containerName.trim()}`);
    if (restart !== "no") lines.push(`    restart: ${restart}`);
    if (removeOnExit) lines.push(`    # Note: --rm is not directly supported in docker-compose; remove the container manually`);

    const activePorts = ports.filter((p) => p.host && p.container);
    if (activePorts.length > 0) {
      lines.push("    ports:");
      for (const p of activePorts) lines.push(`      - "${p.host}:${p.container}"`);
    }

    const activeVolumes = volumes.filter((v) => v.host && v.container);
    if (activeVolumes.length > 0) {
      lines.push("    volumes:");
      for (const v of activeVolumes) lines.push(`      - ${v.host}:${v.container}`);
    }

    const activeEnvs = envVars.filter((e) => e.key);
    if (activeEnvs.length > 0) {
      lines.push("    environment:");
      for (const e of activeEnvs) {
        lines.push(e.value ? `      ${e.key}: "${e.value}"` : `      ${e.key}:`);
      }
    }

    if (resolvedNetwork && resolvedNetwork !== "bridge") {
      lines.push("    networks:");
      lines.push(`      - ${resolvedNetwork}`);
      lines.push("");
      lines.push("networks:");
      lines.push(`  ${resolvedNetwork}:`);
      lines.push("    external: true");
    }

    return lines.join("\n");
  })();

  const inputClass = "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";
  const selectClass = "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white";

  return (
    <div className="space-y-6">
      {/* Basic config */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Basic Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SectionLabel>Image Name <span className="text-red-500">*</span></SectionLabel>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="nginx:latest"
              className={inputClass}
            />
          </div>
          <div>
            <SectionLabel>Container Name</SectionLabel>
            <input
              type="text"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              placeholder="my-container"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Ports */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Port Mappings <span className="text-gray-400 font-normal text-sm">(-p)</span></h2>
          <AddButton onClick={addPort} label="Add port" />
        </div>
        <div className="space-y-2">
          {ports.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <input
                type="text"
                value={p.host}
                onChange={(e) => updatePort(p.id, "host", e.target.value)}
                placeholder="8080"
                className={inputClass}
              />
              <span className="text-gray-400 flex-shrink-0">:</span>
              <input
                type="text"
                value={p.container}
                onChange={(e) => updatePort(p.id, "container", e.target.value)}
                placeholder="80"
                className={inputClass}
              />
              <RemoveButton onClick={() => removePort(p.id)} />
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Host port : Container port</p>
        </div>
      </div>

      {/* Volumes */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Volume Mounts <span className="text-gray-400 font-normal text-sm">(-v)</span></h2>
          <AddButton onClick={addVolume} label="Add volume" />
        </div>
        <div className="space-y-2">
          {volumes.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <input
                type="text"
                value={v.host}
                onChange={(e) => updateVolume(v.id, "host", e.target.value)}
                placeholder="/host/path or named-volume"
                className={inputClass}
              />
              <span className="text-gray-400 flex-shrink-0">:</span>
              <input
                type="text"
                value={v.container}
                onChange={(e) => updateVolume(v.id, "container", e.target.value)}
                placeholder="/container/path"
                className={inputClass}
              />
              <RemoveButton onClick={() => removeVolume(v.id)} />
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Host path or named volume : Container path</p>
        </div>
      </div>

      {/* Env vars */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Environment Variables <span className="text-gray-400 font-normal text-sm">(-e)</span></h2>
          <AddButton onClick={addEnv} label="Add variable" />
        </div>
        <div className="space-y-2">
          {envVars.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              <input
                type="text"
                value={e.key}
                onChange={(ev) => updateEnv(e.id, "key", ev.target.value)}
                placeholder="KEY"
                className={inputClass}
              />
              <span className="text-gray-400 flex-shrink-0">=</span>
              <input
                type="text"
                value={e.value}
                onChange={(ev) => updateEnv(e.id, "value", ev.target.value)}
                placeholder="value"
                className={inputClass}
              />
              <RemoveButton onClick={() => removeEnv(e.id)} />
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Leave value empty to pass from host environment</p>
        </div>
      </div>

      {/* Network, restart, flags */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Runtime Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <SectionLabel>Network</SectionLabel>
            <select value={network} onChange={(e) => setNetwork(e.target.value)} className={selectClass}>
              <option value="bridge">bridge (default)</option>
              <option value="host">host</option>
              <option value="none">none</option>
              <option value="custom">custom...</option>
            </select>
            {network === "custom" && (
              <input
                type="text"
                value={customNetwork}
                onChange={(e) => setCustomNetwork(e.target.value)}
                placeholder="my-network"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>
          <div>
            <SectionLabel>Restart Policy</SectionLabel>
            <select value={restart} onChange={(e) => setRestart(e.target.value)} className={selectClass}>
              <option value="no">no (default)</option>
              <option value="always">always</option>
              <option value="unless-stopped">unless-stopped</option>
              <option value="on-failure">on-failure</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={detached}
              onClick={() => setDetached((d) => !d)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${detached ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${detached ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-700">
              <span className="font-medium">Detached mode</span>
              <span className="text-gray-400 ml-1">(-d)</span>
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={removeOnExit}
              onClick={() => setRemoveOnExit((r) => !r)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${removeOnExit ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${removeOnExit ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-700">
              <span className="font-medium">Remove on exit</span>
              <span className="text-gray-400 ml-1">(--rm)</span>
            </span>
          </label>
        </div>
      </div>

      {/* Output */}
      {image.trim() ? (
        <div className="space-y-4">
          {/* docker run */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <span className="text-sm font-semibold text-gray-200">docker run command</span>
              <CopyButton text={dockerRunCommand} />
            </div>
            <pre className="px-4 py-4 text-sm text-green-300 font-mono whitespace-pre-wrap break-all leading-relaxed overflow-x-auto">
              {dockerRunCommand}
            </pre>
          </div>

          {/* docker-compose */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <span className="text-sm font-semibold text-gray-200">docker-compose.yml</span>
              <CopyButton text={dockerComposeYaml} />
            </div>
            <pre className="px-4 py-4 text-sm text-blue-300 font-mono whitespace-pre-wrap break-all leading-relaxed overflow-x-auto">
              {dockerComposeYaml}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">Enter an image name above to generate your command</p>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Docker Run Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build docker run commands with a visual interface. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Docker Run Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build docker run commands with a visual interface. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
