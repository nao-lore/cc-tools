import { getSortedEntries } from "./dictionary";

export type OutputMode = "ruby" | "parenthetical" | "hiragana";

interface FuriganaSegment {
  text: string;
  reading: string | null; // null means no furigana (already hiragana/katakana/other)
}

// Check if a character is kanji (CJK Unified Ideographs)
function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) // CJK Unified Ideographs Extension A
  );
}

// Check if a string contains any kanji
function containsKanji(str: string): boolean {
  return [...str].some(isKanji);
}

// Parse text into segments with furigana
export function parseFurigana(text: string): FuriganaSegment[] {
  const entries = getSortedEntries();
  const segments: FuriganaSegment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;

    // Try to match the longest dictionary entry first
    for (const [kanji, reading] of entries) {
      if (remaining.startsWith(kanji)) {
        segments.push({ text: kanji, reading });
        remaining = remaining.slice(kanji.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      const char = remaining[0];
      // If the last segment has no reading and this char also has no reading, merge them
      if (
        segments.length > 0 &&
        segments[segments.length - 1].reading === null &&
        !isKanji(char)
      ) {
        segments[segments.length - 1].text += char;
      } else if (isKanji(char)) {
        // Unknown kanji - add without reading
        if (
          segments.length > 0 &&
          segments[segments.length - 1].reading === null &&
          !containsKanji(segments[segments.length - 1].text)
        ) {
          // Previous segment is plain text, start new segment for unknown kanji
          segments.push({ text: char, reading: null });
        } else if (
          segments.length > 0 &&
          segments[segments.length - 1].reading === null
        ) {
          segments[segments.length - 1].text += char;
        } else {
          segments.push({ text: char, reading: null });
        }
      } else {
        if (
          segments.length > 0 &&
          segments[segments.length - 1].reading === null
        ) {
          segments[segments.length - 1].text += char;
        } else {
          segments.push({ text: char, reading: null });
        }
      }
      remaining = remaining.slice(1);
    }
  }

  return segments;
}

// Convert segments to output string based on mode
export function formatOutput(
  segments: FuriganaSegment[],
  mode: OutputMode
): string {
  return segments
    .map((seg) => {
      if (!seg.reading) return seg.text;

      switch (mode) {
        case "ruby":
          return `<ruby>${seg.text}<rt>${seg.reading}</rt></ruby>`;
        case "parenthetical":
          return `${seg.text}(${seg.reading})`;
        case "hiragana":
          return seg.reading;
        default:
          return seg.text;
      }
    })
    .join("");
}

// Main conversion function
export function convertToFurigana(
  text: string,
  mode: OutputMode
): { formatted: string; segments: FuriganaSegment[] } {
  const segments = parseFurigana(text);
  const formatted = formatOutput(segments, mode);
  return { formatted, segments };
}
