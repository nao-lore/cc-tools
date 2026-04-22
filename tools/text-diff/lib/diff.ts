export type DiffType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffType;
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

export interface InlineChange {
  type: DiffType;
  text: string;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

/**
 * Longest Common Subsequence (LCS) based diff algorithm.
 * Computes the edit script between two arrays of lines.
 */
function lcsMatrix(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function normalizeLine(
  line: string,
  ignoreWhitespace: boolean,
  ignoreCase: boolean
): string {
  let result = line;
  if (ignoreWhitespace) {
    result = result.replace(/\s+/g, " ").trim();
  }
  if (ignoreCase) {
    result = result.toLowerCase();
  }
  return result;
}

export function computeDiff(
  original: string,
  modified: string,
  options: { ignoreWhitespace?: boolean; ignoreCase?: boolean } = {}
): DiffLine[] {
  const { ignoreWhitespace = false, ignoreCase = false } = options;

  const origLines = original.split("\n");
  const modLines = modified.split("\n");

  const normOrig = origLines.map((l) =>
    normalizeLine(l, ignoreWhitespace, ignoreCase)
  );
  const normMod = modLines.map((l) =>
    normalizeLine(l, ignoreWhitespace, ignoreCase)
  );

  const dp = lcsMatrix(normOrig, normMod);

  const result: DiffLine[] = [];
  let i = normOrig.length;
  let j = normMod.length;

  // Backtrack through LCS matrix to produce diff
  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normOrig[i - 1] === normMod[j - 1]) {
      stack.push({
        type: "unchanged",
        content: origLines[i - 1],
        oldLineNum: i,
        newLineNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: "added",
        content: modLines[j - 1],
        newLineNum: j,
      });
      j--;
    } else {
      stack.push({
        type: "removed",
        content: origLines[i - 1],
        oldLineNum: i,
      });
      i--;
    }
  }

  // Reverse since we built it backwards
  for (let k = stack.length - 1; k >= 0; k--) {
    result.push(stack[k]);
  }

  return result;
}

/**
 * Character-level inline diff between two strings.
 * Uses the same LCS approach but on characters.
 */
export function computeInlineDiff(
  oldStr: string,
  newStr: string
): InlineChange[] {
  const a = Array.from(oldStr);
  const b = Array.from(newStr);
  const m = a.length;
  const n = b.length;

  // Build LCS matrix for characters
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const changes: InlineChange[] = [];
  let ci = m;
  let cj = n;

  while (ci > 0 || cj > 0) {
    if (ci > 0 && cj > 0 && a[ci - 1] === b[cj - 1]) {
      changes.push({ type: "unchanged", text: a[ci - 1] });
      ci--;
      cj--;
    } else if (cj > 0 && (ci === 0 || dp[ci][cj - 1] >= dp[ci - 1][cj])) {
      changes.push({ type: "added", text: b[cj - 1] });
      cj--;
    } else {
      changes.push({ type: "removed", text: a[ci - 1] });
      ci--;
    }
  }

  changes.reverse();

  // Merge consecutive same-type changes
  const merged: InlineChange[] = [];
  for (const change of changes) {
    if (merged.length > 0 && merged[merged.length - 1].type === change.type) {
      merged[merged.length - 1].text += change.text;
    } else {
      merged.push({ ...change });
    }
  }

  return merged;
}

export function computeStats(diff: DiffLine[]): DiffStats {
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const line of diff) {
    switch (line.type) {
      case "added":
        added++;
        break;
      case "removed":
        removed++;
        break;
      case "unchanged":
        unchanged++;
        break;
    }
  }

  return { added, removed, unchanged };
}

/**
 * Build side-by-side aligned pairs for split view.
 */
export function buildSideBySide(
  diff: DiffLine[]
): { left: DiffLine | null; right: DiffLine | null }[] {
  const pairs: { left: DiffLine | null; right: DiffLine | null }[] = [];

  let i = 0;
  while (i < diff.length) {
    const line = diff[i];

    if (line.type === "unchanged") {
      pairs.push({ left: line, right: line });
      i++;
    } else if (line.type === "removed") {
      // Collect consecutive removed lines
      const removedBatch: DiffLine[] = [];
      while (i < diff.length && diff[i].type === "removed") {
        removedBatch.push(diff[i]);
        i++;
      }
      // Collect consecutive added lines
      const addedBatch: DiffLine[] = [];
      while (i < diff.length && diff[i].type === "added") {
        addedBatch.push(diff[i]);
        i++;
      }
      // Pair them up
      const maxLen = Math.max(removedBatch.length, addedBatch.length);
      for (let k = 0; k < maxLen; k++) {
        pairs.push({
          left: k < removedBatch.length ? removedBatch[k] : null,
          right: k < addedBatch.length ? addedBatch[k] : null,
        });
      }
    } else if (line.type === "added") {
      pairs.push({ left: null, right: line });
      i++;
    }
  }

  return pairs;
}
