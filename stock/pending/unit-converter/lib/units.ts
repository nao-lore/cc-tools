export type CategoryKey =
  | "length"
  | "weight"
  | "temperature"
  | "volume"
  | "area"
  | "speed"
  | "dataSize"
  | "time";

export interface Unit {
  key: string;
  label: string;
  // For linear units: value in base unit. Temperature handled separately.
  toBase?: number;
}

export interface Category {
  key: CategoryKey;
  label: string;
  units: Unit[];
  isTemperature?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    key: "length",
    label: "Length",
    units: [
      { key: "mm",  label: "Millimeter (mm)",  toBase: 0.001 },
      { key: "cm",  label: "Centimeter (cm)",  toBase: 0.01 },
      { key: "m",   label: "Meter (m)",         toBase: 1 },
      { key: "km",  label: "Kilometer (km)",    toBase: 1000 },
      { key: "in",  label: "Inch (in)",         toBase: 0.0254 },
      { key: "ft",  label: "Foot (ft)",         toBase: 0.3048 },
      { key: "yd",  label: "Yard (yd)",         toBase: 0.9144 },
      { key: "mi",  label: "Mile (mi)",         toBase: 1609.344 },
    ],
  },
  {
    key: "weight",
    label: "Weight",
    units: [
      { key: "mg",  label: "Milligram (mg)",   toBase: 0.000001 },
      { key: "g",   label: "Gram (g)",          toBase: 0.001 },
      { key: "kg",  label: "Kilogram (kg)",     toBase: 1 },
      { key: "lb",  label: "Pound (lb)",        toBase: 0.45359237 },
      { key: "oz",  label: "Ounce (oz)",        toBase: 0.028349523125 },
      { key: "ton", label: "Metric Ton (ton)",  toBase: 1000 },
    ],
  },
  {
    key: "temperature",
    label: "Temperature",
    isTemperature: true,
    units: [
      { key: "C", label: "Celsius (°C)" },
      { key: "F", label: "Fahrenheit (°F)" },
      { key: "K", label: "Kelvin (K)" },
    ],
  },
  {
    key: "volume",
    label: "Volume",
    units: [
      { key: "ml",   label: "Milliliter (ml)",     toBase: 0.001 },
      { key: "l",    label: "Liter (L)",            toBase: 1 },
      { key: "gal",  label: "Gallon (US gal)",      toBase: 3.785411784 },
      { key: "qt",   label: "Quart (US qt)",        toBase: 0.946352946 },
      { key: "pt",   label: "Pint (US pt)",         toBase: 0.473176473 },
      { key: "cup",  label: "Cup (US cup)",         toBase: 0.2365882365 },
      { key: "tbsp", label: "Tablespoon (tbsp)",    toBase: 0.01478676478125 },
      { key: "tsp",  label: "Teaspoon (tsp)",       toBase: 0.00492892159375 },
    ],
  },
  {
    key: "area",
    label: "Area",
    units: [
      { key: "mm2",  label: "Sq. Millimeter (mm²)", toBase: 0.000001 },
      { key: "cm2",  label: "Sq. Centimeter (cm²)", toBase: 0.0001 },
      { key: "m2",   label: "Sq. Meter (m²)",       toBase: 1 },
      { key: "km2",  label: "Sq. Kilometer (km²)",  toBase: 1000000 },
      { key: "in2",  label: "Sq. Inch (in²)",       toBase: 0.00064516 },
      { key: "ft2",  label: "Sq. Foot (ft²)",       toBase: 0.09290304 },
      { key: "acre", label: "Acre",                  toBase: 4046.8564224 },
      { key: "ha",   label: "Hectare (ha)",          toBase: 10000 },
    ],
  },
  {
    key: "speed",
    label: "Speed",
    units: [
      { key: "ms",     label: "Meter/sec (m/s)",  toBase: 1 },
      { key: "kmh",    label: "Km/hour (km/h)",   toBase: 1 / 3.6 },
      { key: "mph",    label: "Miles/hour (mph)",  toBase: 0.44704 },
      { key: "knots",  label: "Knots (kn)",        toBase: 0.514444 },
    ],
  },
  {
    key: "dataSize",
    label: "Data Size",
    units: [
      { key: "B",  label: "Byte (B)",      toBase: 1 },
      { key: "KB", label: "Kilobyte (KB)", toBase: 1024 },
      { key: "MB", label: "Megabyte (MB)", toBase: 1048576 },
      { key: "GB", label: "Gigabyte (GB)", toBase: 1073741824 },
      { key: "TB", label: "Terabyte (TB)", toBase: 1099511627776 },
      { key: "PB", label: "Petabyte (PB)", toBase: 1125899906842624 },
    ],
  },
  {
    key: "time",
    label: "Time",
    units: [
      { key: "ms",    label: "Millisecond (ms)", toBase: 0.001 },
      { key: "s",     label: "Second (s)",        toBase: 1 },
      { key: "min",   label: "Minute (min)",      toBase: 60 },
      { key: "hr",    label: "Hour (hr)",          toBase: 3600 },
      { key: "day",   label: "Day",                toBase: 86400 },
      { key: "week",  label: "Week",               toBase: 604800 },
      { key: "month", label: "Month (avg)",        toBase: 2629746 },
      { key: "year",  label: "Year (avg)",         toBase: 31556952 },
    ],
  },
];

/** Convert temperature between units. Returns null for invalid input. */
export function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;
  // Convert from → Celsius first
  let celsius: number;
  if (from === "C") celsius = value;
  else if (from === "F") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15; // K

  // Celsius → to
  if (to === "C") return celsius;
  if (to === "F") return celsius * (9 / 5) + 32;
  return celsius + 273.15; // K
}

/** Convert between linear units (non-temperature). Returns null for invalid. */
export function convertLinear(value: number, fromUnit: Unit, toUnit: Unit): number {
  const base = value * (fromUnit.toBase ?? 1);
  return base / (toUnit.toBase ?? 1);
}

/** Format a number nicely — avoid scientific notation for reasonable ranges. */
export function formatNumber(n: number): string {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || (abs < 1e-6 && abs > 0)) {
    return n.toExponential(6);
  }
  // Up to 10 significant digits, strip trailing zeros
  const str = n.toPrecision(10);
  return parseFloat(str).toString();
}
