"use client";

import { useState, useCallback } from "react";

type Operation =
  | "ADD"
  | "SUBTRACT"
  | "SCALAR"
  | "MULTIPLY"
  | "TRANSPOSE"
  | "DETERMINANT"
  | "INVERSE";

const OPERATIONS: { value: Operation; label: string; needsB: boolean; squareOnly?: boolean }[] = [
  { value: "ADD",         label: "A + B",          needsB: true  },
  { value: "SUBTRACT",   label: "A − B",           needsB: true  },
  { value: "SCALAR",     label: "A × scalar",      needsB: false },
  { value: "MULTIPLY",   label: "A × B",           needsB: true  },
  { value: "TRANSPOSE",  label: "Transpose (A)",   needsB: false },
  { value: "DETERMINANT",label: "Determinant (A)", needsB: false, squareOnly: true },
  { value: "INVERSE",    label: "Inverse (A)",     needsB: false, squareOnly: true },
];

type Matrix = number[][];

function makeMatrix(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function parseCell(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function fmt(n: number): string {
  if (Object.is(n, -0)) return "0";
  // Show fractions nicely (up to 6 decimal places, strip trailing zeros)
  const s = parseFloat(n.toFixed(6)).toString();
  return s;
}

// ---------- math helpers ----------

function addMatrices(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

function subtractMatrices(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((v, j) => v - B[i][j]));
}

function scalarMultiply(A: Matrix, s: number): Matrix {
  return A.map(row => row.map(v => v * s));
}

function multiplyMatrices(A: Matrix, B: Matrix): Matrix {
  const rA = A.length, cA = A[0].length, cB = B[0].length;
  return Array.from({ length: rA }, (_, i) =>
    Array.from({ length: cB }, (_, j) =>
      Array.from({ length: cA }, (_, k) => A[i][k] * B[k][j]).reduce((a, b) => a + b, 0)
    )
  );
}

function transpose(A: Matrix): Matrix {
  return A[0].map((_, j) => A.map(row => row[j]));
}

function det2(A: Matrix): number {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

function det3(A: Matrix): number {
  const [a, b, c] = A[0];
  const [d, e, f] = A[1];
  const [g, h, i] = A[2];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function cofactorExpansion(A: Matrix): number {
  const n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return det2(A);
  if (n === 3) return det3(A);
  let d = 0;
  for (let j = 0; j < n; j++) {
    const minor = A.slice(1).map(row => row.filter((_, c) => c !== j));
    d += (j % 2 === 0 ? 1 : -1) * A[0][j] * cofactorExpansion(minor);
  }
  return d;
}

// Gaussian elimination inverse
function inverseMatrix(A: Matrix): Matrix | null {
  const n = A.length;
  const aug: number[][] = A.map((row, i) => {
    const id = Array(n).fill(0);
    id[i] = 1;
    return [...row, ...id];
  });
  for (let col = 0; col < n; col++) {
    let pivotRow = -1;
    for (let row = col; row < n; row++) {
      if (Math.abs(aug[row][col]) > 1e-12) { pivotRow = row; break; }
    }
    if (pivotRow === -1) return null;
    [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
    const pivot = aug[col][col];
    aug[col] = aug[col].map(v => v / pivot);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      aug[row] = aug[row].map((v, k) => v - factor * aug[col][k]);
    }
  }
  return aug.map(row => row.slice(n));
}

// ---------- step-by-step ----------

interface Step {
  label: string;
  lines: string[];
}

function det2Steps(A: Matrix): Step[] {
  const [[a, b], [c, d]] = A;
  return [
    {
      label: "Formula for 2×2 determinant",
      lines: ["det(A) = ad − bc"],
    },
    {
      label: "Substitute values",
      lines: [`det(A) = (${fmt(a)})(${fmt(d)}) − (${fmt(b)})(${fmt(c)})`],
    },
    {
      label: "Multiply",
      lines: [`det(A) = ${fmt(a * d)} − ${fmt(b * c)}`],
    },
    {
      label: "Result",
      lines: [`det(A) = ${fmt(a * d - b * c)}`],
    },
  ];
}

function det3Steps(A: Matrix): Step[] {
  const [a, b, c] = A[0];
  const [d, e, f] = A[1];
  const [g, h, i] = A[2];
  const m00 = e * i - f * h;
  const m01 = d * i - f * g;
  const m02 = d * h - e * g;
  const result = a * m00 - b * m01 + c * m02;
  return [
    {
      label: "Cofactor expansion along row 1",
      lines: ["det(A) = a(ei − fh) − b(di − fg) + c(dh − eg)"],
    },
    {
      label: "Identify values",
      lines: [
        `a=${fmt(a)}, b=${fmt(b)}, c=${fmt(c)}`,
        `d=${fmt(d)}, e=${fmt(e)}, f=${fmt(f)}`,
        `g=${fmt(g)}, h=${fmt(h)}, i=${fmt(i)}`,
      ],
    },
    {
      label: "Compute 2×2 minors",
      lines: [
        `ei − fh = ${fmt(e)}×${fmt(i)} − ${fmt(f)}×${fmt(h)} = ${fmt(m00)}`,
        `di − fg = ${fmt(d)}×${fmt(i)} − ${fmt(f)}×${fmt(g)} = ${fmt(m01)}`,
        `dh − eg = ${fmt(d)}×${fmt(h)} − ${fmt(e)}×${fmt(g)} = ${fmt(m02)}`,
      ],
    },
    {
      label: "Combine",
      lines: [
        `det(A) = ${fmt(a)}×${fmt(m00)} − ${fmt(b)}×${fmt(m01)} + ${fmt(c)}×${fmt(m02)}`,
        `       = ${fmt(a * m00)} − ${fmt(b * m01)} + ${fmt(c * m02)}`,
        `       = ${fmt(result)}`,
      ],
    },
  ];
}

// ---------- MatrixGrid ----------

function MatrixGrid({
  label,
  rows,
  cols,
  values,
  onChange,
  readOnly = false,
}: {
  label: string;
  rows: number;
  cols: number;
  values: string[][];
  onChange?: (r: number, c: number, v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{label}</p>
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <input
              key={`${r}-${c}`}
              type="text"
              inputMode="decimal"
              value={values[r]?.[c] ?? "0"}
              onChange={e => onChange?.(r, c, e.target.value)}
              readOnly={readOnly}
              className={`w-14 h-10 text-center font-mono text-sm border rounded-lg outline-none transition-colors ${
                readOnly
                  ? "bg-blue-50 border-blue-200 text-blue-900 font-semibold cursor-default"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              }`}
              spellCheck={false}
              autoComplete="off"
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- main component ----------

export default function MatrixCalculator() {
  const [rowsA, setRowsA] = useState(2);
  const [colsA, setColsA] = useState(2);
  const [rowsB, setRowsB] = useState(2);
  const [colsB, setColsB] = useState(2);
  const [cellsA, setCellsA] = useState<string[][]>(() => [["1","2"],["3","4"]]);
  const [cellsB, setCellsB] = useState<string[][]>(() => [["5","6"],["7","8"]]);
  const [op, setOp] = useState<Operation>("ADD");
  const [scalar, setScalar] = useState("2");
  const [result, setResult] = useState<Matrix | null>(null);
  const [detResult, setDetResult] = useState<number | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const opDef = OPERATIONS.find(o => o.value === op)!;

  // resize helpers
  function resizeGrid(
    prev: string[][],
    newRows: number,
    newCols: number
  ): string[][] {
    return Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => prev[r]?.[c] ?? "0")
    );
  }

  function handleRowsA(v: number) {
    setRowsA(v);
    setCellsA(prev => resizeGrid(prev, v, colsA));
    setResult(null); setDetResult(null); setError("");
  }
  function handleColsA(v: number) {
    setColsA(v);
    setCellsA(prev => resizeGrid(prev, rowsA, v));
    setResult(null); setDetResult(null); setError("");
  }
  function handleRowsB(v: number) {
    setRowsB(v);
    setCellsB(prev => resizeGrid(prev, v, colsB));
    setResult(null); setDetResult(null); setError("");
  }
  function handleColsB(v: number) {
    setColsB(v);
    setCellsB(prev => resizeGrid(prev, rowsB, v));
    setResult(null); setDetResult(null); setError("");
  }

  function updateCellA(r: number, c: number, v: string) {
    setCellsA(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = v;
      return next;
    });
    setResult(null); setDetResult(null); setError("");
  }

  function updateCellB(r: number, c: number, v: string) {
    setCellsB(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = v;
      return next;
    });
    setResult(null); setDetResult(null); setError("");
  }

  const getMatrixA = (): Matrix =>
    cellsA.map(row => row.map(parseCell));
  const getMatrixB = (): Matrix =>
    cellsB.map(row => row.map(parseCell));

  const handleCalculate = useCallback(() => {
    setError("");
    setResult(null);
    setDetResult(null);
    setSteps([]);
    setShowSteps(false);

    const A = getMatrixA();

    if (op === "TRANSPOSE") {
      setResult(transpose(A));
      return;
    }

    if (op === "SCALAR") {
      const s = parseFloat(scalar);
      if (isNaN(s)) { setError("Scalar must be a valid number."); return; }
      setResult(scalarMultiply(A, s));
      return;
    }

    if (op === "DETERMINANT") {
      if (rowsA !== colsA) { setError("Determinant requires a square matrix."); return; }
      const d = cofactorExpansion(A);
      setDetResult(d);
      if (rowsA === 2) setSteps(det2Steps(A));
      else if (rowsA === 3) setSteps(det3Steps(A));
      return;
    }

    if (op === "INVERSE") {
      if (rowsA !== colsA) { setError("Inverse requires a square matrix."); return; }
      const inv = inverseMatrix(A);
      if (!inv) { setError("Matrix is singular (determinant = 0). Inverse does not exist."); return; }
      setResult(inv);
      return;
    }

    // Binary ops
    const B = getMatrixB();

    if (op === "ADD" || op === "SUBTRACT") {
      if (rowsA !== rowsB || colsA !== colsB) {
        setError(`Dimensions must match for ${op === "ADD" ? "addition" : "subtraction"}. A is ${rowsA}×${colsA}, B is ${rowsB}×${colsB}.`);
        return;
      }
      setResult(op === "ADD" ? addMatrices(A, B) : subtractMatrices(A, B));
      return;
    }

    if (op === "MULTIPLY") {
      if (colsA !== rowsB) {
        setError(`Multiplication requires cols(A) = rows(B). A has ${colsA} columns, B has ${rowsB} rows.`);
        return;
      }
      setResult(multiplyMatrices(A, B));
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op, cellsA, cellsB, rowsA, colsA, rowsB, colsB, scalar]);

  const resultCells: string[][] = result
    ? result.map(row => row.map(fmt))
    : [];

  const resultRows = result ? result.length : 0;
  const resultCols = result ? result[0].length : 0;

  async function handleCopy() {
    const rows = result ?? [];
    const text = rows.map(row => row.map(fmt).join("\t")).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const COPY_ICON = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
    </svg>
  );
  const CHECK_ICON = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const sizeSelect = (val: number, onChange: (v: number) => void, label: string) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{label}</span>
      <select
        value={val}
        onChange={e => onChange(Number(e.target.value))}
        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white outline-none focus:border-blue-500"
      >
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Operation selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Operation</label>
        <div className="flex flex-wrap gap-2">
          {OPERATIONS.map(o => (
            <button
              key={o.value}
              onClick={() => { setOp(o.value); setResult(null); setDetResult(null); setError(""); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                op === o.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix inputs */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Matrix A */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Matrix A</span>
              {sizeSelect(rowsA, handleRowsA, "rows")}
              {sizeSelect(colsA, handleColsA, "cols")}
            </div>
            <MatrixGrid
              label=""
              rows={rowsA}
              cols={colsA}
              values={cellsA}
              onChange={updateCellA}
            />
          </div>

          {/* Scalar input */}
          {op === "SCALAR" && (
            <div className="flex flex-col justify-center">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">Scalar</label>
              <input
                type="text"
                inputMode="decimal"
                value={scalar}
                onChange={e => { setScalar(e.target.value); setResult(null); setError(""); }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

          {/* Matrix B */}
          {opDef.needsB && (
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Matrix B</span>
                {sizeSelect(rowsB, handleRowsB, "rows")}
                {sizeSelect(colsB, handleColsB, "cols")}
              </div>
              <MatrixGrid
                label=""
                rows={rowsB}
                cols={colsB}
                values={cellsB}
                onChange={updateCellB}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleCalculate}
          className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Calculate
        </button>
      </div>

      {/* Determinant result */}
      {detResult !== null && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-5">
          <p className="text-sm text-blue-600 font-medium mb-1">Determinant</p>
          <p className="font-mono text-3xl font-bold text-blue-900">{fmt(detResult)}</p>
          {steps.length > 0 && (
            <button
              onClick={() => setShowSteps(v => !v)}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showSteps ? "Hide step-by-step" : "Show step-by-step"}
            </button>
          )}
        </div>
      )}

      {/* Step-by-step */}
      {showSteps && steps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Step-by-step Solution</h3>
          <ol className="space-y-4">
            {steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">{step.label}</p>
                  {step.lines.map((line, li) => (
                    <p key={li} className="font-mono text-sm text-gray-700 bg-gray-50 rounded px-3 py-1 mt-0.5">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Matrix result */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Result ({resultRows}×{resultCols})
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
              title="Copy as tab-separated values"
            >
              {copied ? CHECK_ICON : COPY_ICON}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <MatrixGrid
            label=""
            rows={resultRows}
            cols={resultCols}
            values={resultCells}
            readOnly
          />
        </div>
      )}

      {/* Dimension rules reference */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Dimension Rules</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Operation</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Requirement</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Result size</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                { op: "A + B / A − B", req: "Same dimensions",         result: "m × n" },
                { op: "A × scalar",    req: "Any matrix",              result: "m × n" },
                { op: "A × B",         req: "cols(A) = rows(B)",       result: "rows(A) × cols(B)" },
                { op: "Transpose(A)",  req: "Any matrix",              result: "n × m" },
                { op: "det(A)",        req: "Square matrix",           result: "Scalar" },
                { op: "A⁻¹",          req: "Square, det(A) ≠ 0",      result: "n × n" },
              ].map(row => (
                <tr key={row.op} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 font-mono text-blue-700 text-xs font-semibold">{row.op}</td>
                  <td className="py-2 px-3 text-gray-600 text-xs">{row.req}</td>
                  <td className="py-2 px-3 font-mono text-gray-600 text-xs">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
