"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type App = "VS Code" | "Chrome DevTools" | "macOS" | "Windows" | "Figma";
type OS = "mac" | "win" | "all";

interface Shortcut {
  id: string;
  app: App;
  os: OS;
  action: string;
  keys: string[];
}

// ─── Shortcut Database ────────────────────────────────────────────────────────

const SHORTCUTS: Shortcut[] = [
  // VS Code — 22 entries
  { id: "vsc-01", app: "VS Code", os: "mac", action: "Command Palette", keys: ["⌘", "⇧", "P"] },
  { id: "vsc-02", app: "VS Code", os: "win", action: "Command Palette", keys: ["Ctrl", "⇧", "P"] },
  { id: "vsc-03", app: "VS Code", os: "mac", action: "Quick Open File", keys: ["⌘", "P"] },
  { id: "vsc-04", app: "VS Code", os: "win", action: "Quick Open File", keys: ["Ctrl", "P"] },
  { id: "vsc-05", app: "VS Code", os: "mac", action: "Toggle Sidebar", keys: ["⌘", "B"] },
  { id: "vsc-06", app: "VS Code", os: "win", action: "Toggle Sidebar", keys: ["Ctrl", "B"] },
  { id: "vsc-07", app: "VS Code", os: "mac", action: "Toggle Terminal", keys: ["⌘", "`"] },
  { id: "vsc-08", app: "VS Code", os: "win", action: "Toggle Terminal", keys: ["Ctrl", "`"] },
  { id: "vsc-09", app: "VS Code", os: "mac", action: "Find in Files", keys: ["⌘", "⇧", "F"] },
  { id: "vsc-10", app: "VS Code", os: "win", action: "Find in Files", keys: ["Ctrl", "⇧", "F"] },
  { id: "vsc-11", app: "VS Code", os: "mac", action: "Go to Definition", keys: ["F12"] },
  { id: "vsc-12", app: "VS Code", os: "win", action: "Go to Definition", keys: ["F12"] },
  { id: "vsc-13", app: "VS Code", os: "mac", action: "Rename Symbol", keys: ["F2"] },
  { id: "vsc-14", app: "VS Code", os: "win", action: "Rename Symbol", keys: ["F2"] },
  { id: "vsc-15", app: "VS Code", os: "mac", action: "Multi-cursor Add", keys: ["⌥", "Click"] },
  { id: "vsc-16", app: "VS Code", os: "win", action: "Multi-cursor Add", keys: ["Alt", "Click"] },
  { id: "vsc-17", app: "VS Code", os: "mac", action: "Select All Occurrences", keys: ["⌘", "⇧", "L"] },
  { id: "vsc-18", app: "VS Code", os: "win", action: "Select All Occurrences", keys: ["Ctrl", "⇧", "L"] },
  { id: "vsc-19", app: "VS Code", os: "mac", action: "Format Document", keys: ["⌥", "⇧", "F"] },
  { id: "vsc-20", app: "VS Code", os: "win", action: "Format Document", keys: ["Alt", "⇧", "F"] },
  { id: "vsc-21", app: "VS Code", os: "mac", action: "Split Editor", keys: ["⌘", "\\"] },
  { id: "vsc-22", app: "VS Code", os: "win", action: "Split Editor", keys: ["Ctrl", "\\"] },
  { id: "vsc-23", app: "VS Code", os: "mac", action: "Move Line Down", keys: ["⌥", "↓"] },
  { id: "vsc-24", app: "VS Code", os: "win", action: "Move Line Down", keys: ["Alt", "↓"] },
  { id: "vsc-25", app: "VS Code", os: "mac", action: "Duplicate Line", keys: ["⌥", "⇧", "↓"] },
  { id: "vsc-26", app: "VS Code", os: "win", action: "Duplicate Line", keys: ["Alt", "⇧", "↓"] },

  // Chrome DevTools — 16 entries
  { id: "chr-01", app: "Chrome DevTools", os: "mac", action: "Open DevTools", keys: ["⌘", "⌥", "I"] },
  { id: "chr-02", app: "Chrome DevTools", os: "win", action: "Open DevTools", keys: ["F12"] },
  { id: "chr-03", app: "Chrome DevTools", os: "mac", action: "Open Console", keys: ["⌘", "⌥", "J"] },
  { id: "chr-04", app: "Chrome DevTools", os: "win", action: "Open Console", keys: ["Ctrl", "⇧", "J"] },
  { id: "chr-05", app: "Chrome DevTools", os: "all", action: "Toggle Device Mode", keys: ["Ctrl", "⇧", "M"] },
  { id: "chr-06", app: "Chrome DevTools", os: "all", action: "Run Command", keys: ["Ctrl", "⇧", "P"] },
  { id: "chr-07", app: "Chrome DevTools", os: "all", action: "Clear Console", keys: ["Ctrl", "L"] },
  { id: "chr-08", app: "Chrome DevTools", os: "all", action: "Inspect Element", keys: ["Ctrl", "⇧", "C"] },
  { id: "chr-09", app: "Chrome DevTools", os: "all", action: "Next Panel", keys: ["Ctrl", "]"] },
  { id: "chr-10", app: "Chrome DevTools", os: "all", action: "Previous Panel", keys: ["Ctrl", "["] },
  { id: "chr-11", app: "Chrome DevTools", os: "all", action: "Expand All Nodes", keys: ["Alt", "Click"] },
  { id: "chr-12", app: "Chrome DevTools", os: "all", action: "Step Over (Debugger)", keys: ["F10"] },
  { id: "chr-13", app: "Chrome DevTools", os: "all", action: "Step Into (Debugger)", keys: ["F11"] },
  { id: "chr-14", app: "Chrome DevTools", os: "all", action: "Resume Script", keys: ["F8"] },
  { id: "chr-15", app: "Chrome DevTools", os: "mac", action: "Toggle Dark Mode", keys: ["⌘", "⇧", "D"] },
  { id: "chr-16", app: "Chrome DevTools", os: "all", action: "Focus URL Bar", keys: ["Ctrl", "L"] },

  // macOS — 18 entries
  { id: "mac-01", app: "macOS", os: "mac", action: "Spotlight Search", keys: ["⌘", "Space"] },
  { id: "mac-02", app: "macOS", os: "mac", action: "Screenshot (Region)", keys: ["⌘", "⇧", "4"] },
  { id: "mac-03", app: "macOS", os: "mac", action: "Screenshot (Screen)", keys: ["⌘", "⇧", "3"] },
  { id: "mac-04", app: "macOS", os: "mac", action: "Screenshot to Clipboard", keys: ["⌘", "⇧", "4", "Space"] },
  { id: "mac-05", app: "macOS", os: "mac", action: "Lock Screen", keys: ["⌘", "Ctrl", "Q"] },
  { id: "mac-06", app: "macOS", os: "mac", action: "Force Quit", keys: ["⌘", "⌥", "Esc"] },
  { id: "mac-07", app: "macOS", os: "mac", action: "Mission Control", keys: ["Ctrl", "↑"] },
  { id: "mac-08", app: "macOS", os: "mac", action: "App Expose", keys: ["Ctrl", "↓"] },
  { id: "mac-09", app: "macOS", os: "mac", action: "Switch App", keys: ["⌘", "Tab"] },
  { id: "mac-10", app: "macOS", os: "mac", action: "Switch Window (Same App)", keys: ["⌘", "`"] },
  { id: "mac-11", app: "macOS", os: "mac", action: "Close Window", keys: ["⌘", "W"] },
  { id: "mac-12", app: "macOS", os: "mac", action: "Quit App", keys: ["⌘", "Q"] },
  { id: "mac-13", app: "macOS", os: "mac", action: "Hide App", keys: ["⌘", "H"] },
  { id: "mac-14", app: "macOS", os: "mac", action: "Minimize Window", keys: ["⌘", "M"] },
  { id: "mac-15", app: "macOS", os: "mac", action: "Move to Trash", keys: ["⌘", "Delete"] },
  { id: "mac-16", app: "macOS", os: "mac", action: "Undo", keys: ["⌘", "Z"] },
  { id: "mac-17", app: "macOS", os: "mac", action: "Redo", keys: ["⌘", "⇧", "Z"] },
  { id: "mac-18", app: "macOS", os: "mac", action: "Emoji & Symbols", keys: ["⌘", "Ctrl", "Space"] },

  // Windows — 18 entries
  { id: "win-01", app: "Windows", os: "win", action: "Search / Start", keys: ["Win"] },
  { id: "win-02", app: "Windows", os: "win", action: "Action Center", keys: ["Win", "A"] },
  { id: "win-03", app: "Windows", os: "win", action: "Settings", keys: ["Win", "I"] },
  { id: "win-04", app: "Windows", os: "win", action: "Lock Screen", keys: ["Win", "L"] },
  { id: "win-05", app: "Windows", os: "win", action: "Task View", keys: ["Win", "Tab"] },
  { id: "win-06", app: "Windows", os: "win", action: "Virtual Desktop (New)", keys: ["Win", "Ctrl", "D"] },
  { id: "win-07", app: "Windows", os: "win", action: "Virtual Desktop (Next)", keys: ["Win", "Ctrl", "→"] },
  { id: "win-08", app: "Windows", os: "win", action: "Screenshot (Region)", keys: ["Win", "⇧", "S"] },
  { id: "win-09", app: "Windows", os: "win", action: "Screenshot (Full)", keys: ["Win", "PrtSc"] },
  { id: "win-10", app: "Windows", os: "win", action: "Task Manager", keys: ["Ctrl", "⇧", "Esc"] },
  { id: "win-11", app: "Windows", os: "win", action: "File Explorer", keys: ["Win", "E"] },
  { id: "win-12", app: "Windows", os: "win", action: "Snap Left", keys: ["Win", "←"] },
  { id: "win-13", app: "Windows", os: "win", action: "Snap Right", keys: ["Win", "→"] },
  { id: "win-14", app: "Windows", os: "win", action: "Emoji Picker", keys: ["Win", "."] },
  { id: "win-15", app: "Windows", os: "win", action: "Clipboard History", keys: ["Win", "V"] },
  { id: "win-16", app: "Windows", os: "win", action: "Run Dialog", keys: ["Win", "R"] },
  { id: "win-17", app: "Windows", os: "win", action: "Minimize All Windows", keys: ["Win", "D"] },
  { id: "win-18", app: "Windows", os: "win", action: "Focus Taskbar", keys: ["Win", "T"] },

  // Figma — 12 entries
  { id: "fig-01", app: "Figma", os: "all", action: "Scale Tool", keys: ["K"] },
  { id: "fig-02", app: "Figma", os: "all", action: "Frame Tool", keys: ["F"] },
  { id: "fig-03", app: "Figma", os: "all", action: "Rectangle Tool", keys: ["R"] },
  { id: "fig-04", app: "Figma", os: "all", action: "Text Tool", keys: ["T"] },
  { id: "fig-05", app: "Figma", os: "all", action: "Pen Tool", keys: ["P"] },
  { id: "fig-06", app: "Figma", os: "mac", action: "Components Panel", keys: ["⌥", "2"] },
  { id: "fig-07", app: "Figma", os: "win", action: "Components Panel", keys: ["Alt", "2"] },
  { id: "fig-08", app: "Figma", os: "mac", action: "Zoom to Fit", keys: ["⇧", "1"] },
  { id: "fig-09", app: "Figma", os: "win", action: "Zoom to Fit", keys: ["⇧", "1"] },
  { id: "fig-10", app: "Figma", os: "mac", action: "Group Selection", keys: ["⌘", "G"] },
  { id: "fig-11", app: "Figma", os: "win", action: "Group Selection", keys: ["Ctrl", "G"] },
  { id: "fig-12", app: "Figma", os: "mac", action: "Auto Layout", keys: ["⌥", "⇧", "A"] },
  { id: "fig-13", app: "Figma", os: "win", action: "Auto Layout", keys: ["Alt", "⇧", "A"] },
  { id: "fig-14", app: "Figma", os: "all", action: "Toggle Rulers", keys: ["⇧", "R"] },
];

const APPS: App[] = ["VS Code", "Chrome DevTools", "macOS", "Windows", "Figma"];

// ─── KeyCap Badge ─────────────────────────────────────────────────────────────

function KeyCap({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 rounded-md border border-border bg-background text-foreground text-xs font-mono font-medium shadow-sm select-none">
      {label}
    </span>
  );
}

// ─── Shortcut Card ────────────────────────────────────────────────────────────

interface ShortcutCardProps {
  shortcut: Shortcut;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

function ShortcutCard({ shortcut, isFavorite, onToggleFavorite }: ShortcutCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3 group">
      <button
        onClick={() => onToggleFavorite(shortcut.id)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="shrink-0 text-lg leading-none transition-transform hover:scale-125"
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{shortcut.action}</p>
        <p className="text-xs text-muted mt-0.5">{shortcut.app}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end max-w-[180px]">
        {shortcut.keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            <KeyCap label={key} />
            {i < shortcut.keys.length - 1 && (
              <span className="text-muted text-xs">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KeyboardShortcutFinder() {
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<App | "All">("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ksf-favorites");
      if (stored) setFavorites(new Set(JSON.parse(stored)));
    } catch {
      // ignore
    }
  }, []);

  // Persist favorites to localStorage
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("ksf-favorites", JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SHORTCUTS.filter((s) => {
      if (selectedApp !== "All" && s.app !== selectedApp) return false;
      if (showFavoritesOnly && !favorites.has(s.id)) return false;
      if (q && !s.action.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, selectedApp, showFavoritesOnly, favorites]);

  const favoriteCount = favorites.size;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Filter Shortcuts</h3>

        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions… e.g. Format, Screenshot"
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          aria-label="Search shortcuts by action name"
        />

        {/* App filter + favorites toggle */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value as App | "All")}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer"
            aria-label="Filter by application"
          >
            <option value="All">All Apps</option>
            {APPS.map((app) => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFavoritesOnly((v) => !v)}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              showFavoritesOnly
                ? "bg-accent text-white"
                : "bg-background border border-border text-foreground hover:border-accent"
            }`}
            aria-pressed={showFavoritesOnly}
          >
            ★ Favorites {favoriteCount > 0 && `(${favoriteCount})`}
          </button>

          {(search || selectedApp !== "All" || showFavoritesOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedApp("All");
                setShowFavoritesOnly(false);
              }}
              className="px-3 py-2 text-sm rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
            >
              Clear
            </button>
          )}

          <span className="ml-auto text-xs text-muted">
            {filtered.length} shortcut{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((s) => (
            <ShortcutCard
              key={s.id}
              shortcut={s}
              isFavorite={favorites.has(s.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <p className="text-muted text-sm">No shortcuts found.</p>
          <p className="text-muted text-xs mt-1">Try a different search term or app.</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
