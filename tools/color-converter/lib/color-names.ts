// CSS named colors for "closest color name" feature
// Subset of the full CSS named colors list (148 colors)

import type { RGB } from "./color-utils";

interface NamedColor {
  name: string;
  rgb: RGB;
}

const NAMED_COLORS: NamedColor[] = [
  { name: "Black", rgb: { r: 0, g: 0, b: 0 } },
  { name: "White", rgb: { r: 255, g: 255, b: 255 } },
  { name: "Red", rgb: { r: 255, g: 0, b: 0 } },
  { name: "Lime", rgb: { r: 0, g: 255, b: 0 } },
  { name: "Blue", rgb: { r: 0, g: 0, b: 255 } },
  { name: "Yellow", rgb: { r: 255, g: 255, b: 0 } },
  { name: "Cyan", rgb: { r: 0, g: 255, b: 255 } },
  { name: "Magenta", rgb: { r: 255, g: 0, b: 255 } },
  { name: "Silver", rgb: { r: 192, g: 192, b: 192 } },
  { name: "Gray", rgb: { r: 128, g: 128, b: 128 } },
  { name: "Maroon", rgb: { r: 128, g: 0, b: 0 } },
  { name: "Olive", rgb: { r: 128, g: 128, b: 0 } },
  { name: "Green", rgb: { r: 0, g: 128, b: 0 } },
  { name: "Purple", rgb: { r: 128, g: 0, b: 128 } },
  { name: "Teal", rgb: { r: 0, g: 128, b: 128 } },
  { name: "Navy", rgb: { r: 0, g: 0, b: 128 } },
  { name: "Orange", rgb: { r: 255, g: 165, b: 0 } },
  { name: "OrangeRed", rgb: { r: 255, g: 69, b: 0 } },
  { name: "Tomato", rgb: { r: 255, g: 99, b: 71 } },
  { name: "Coral", rgb: { r: 255, g: 127, b: 80 } },
  { name: "Salmon", rgb: { r: 250, g: 128, b: 114 } },
  { name: "Crimson", rgb: { r: 220, g: 20, b: 60 } },
  { name: "FireBrick", rgb: { r: 178, g: 34, b: 34 } },
  { name: "DarkRed", rgb: { r: 139, g: 0, b: 0 } },
  { name: "Pink", rgb: { r: 255, g: 192, b: 203 } },
  { name: "HotPink", rgb: { r: 255, g: 105, b: 180 } },
  { name: "DeepPink", rgb: { r: 255, g: 20, b: 147 } },
  { name: "Gold", rgb: { r: 255, g: 215, b: 0 } },
  { name: "Khaki", rgb: { r: 240, g: 230, b: 140 } },
  { name: "Violet", rgb: { r: 238, g: 130, b: 238 } },
  { name: "Orchid", rgb: { r: 218, g: 112, b: 214 } },
  { name: "Plum", rgb: { r: 221, g: 160, b: 221 } },
  { name: "Indigo", rgb: { r: 75, g: 0, b: 130 } },
  { name: "SlateBlue", rgb: { r: 106, g: 90, b: 205 } },
  { name: "MediumPurple", rgb: { r: 147, g: 112, b: 219 } },
  { name: "GreenYellow", rgb: { r: 173, g: 255, b: 47 } },
  { name: "Chartreuse", rgb: { r: 127, g: 255, b: 0 } },
  { name: "LimeGreen", rgb: { r: 50, g: 205, b: 50 } },
  { name: "SpringGreen", rgb: { r: 0, g: 255, b: 127 } },
  { name: "SeaGreen", rgb: { r: 46, g: 139, b: 87 } },
  { name: "ForestGreen", rgb: { r: 34, g: 139, b: 34 } },
  { name: "DarkGreen", rgb: { r: 0, g: 100, b: 0 } },
  { name: "Aquamarine", rgb: { r: 127, g: 255, b: 212 } },
  { name: "Turquoise", rgb: { r: 64, g: 224, b: 208 } },
  { name: "SteelBlue", rgb: { r: 70, g: 130, b: 180 } },
  { name: "DodgerBlue", rgb: { r: 30, g: 144, b: 255 } },
  { name: "DeepSkyBlue", rgb: { r: 0, g: 191, b: 255 } },
  { name: "CornflowerBlue", rgb: { r: 100, g: 149, b: 237 } },
  { name: "RoyalBlue", rgb: { r: 65, g: 105, b: 225 } },
  { name: "MediumBlue", rgb: { r: 0, g: 0, b: 205 } },
  { name: "DarkBlue", rgb: { r: 0, g: 0, b: 139 } },
  { name: "MidnightBlue", rgb: { r: 25, g: 25, b: 112 } },
  { name: "Cornsilk", rgb: { r: 255, g: 248, b: 220 } },
  { name: "BlanchedAlmond", rgb: { r: 255, g: 235, b: 205 } },
  { name: "Bisque", rgb: { r: 255, g: 228, b: 196 } },
  { name: "Wheat", rgb: { r: 245, g: 222, b: 179 } },
  { name: "BurlyWood", rgb: { r: 222, g: 184, b: 135 } },
  { name: "Tan", rgb: { r: 210, g: 180, b: 140 } },
  { name: "Chocolate", rgb: { r: 210, g: 105, b: 30 } },
  { name: "SaddleBrown", rgb: { r: 139, g: 69, b: 19 } },
  { name: "Sienna", rgb: { r: 160, g: 82, b: 45 } },
  { name: "Brown", rgb: { r: 165, g: 42, b: 42 } },
  { name: "Snow", rgb: { r: 255, g: 250, b: 250 } },
  { name: "Ivory", rgb: { r: 255, g: 255, b: 240 } },
  { name: "LavenderBlush", rgb: { r: 255, g: 240, b: 245 } },
  { name: "Lavender", rgb: { r: 230, g: 230, b: 250 } },
  { name: "MistyRose", rgb: { r: 255, g: 228, b: 225 } },
  { name: "AntiqueWhite", rgb: { r: 250, g: 235, b: 215 } },
  { name: "Linen", rgb: { r: 250, g: 240, b: 230 } },
  { name: "Beige", rgb: { r: 245, g: 245, b: 220 } },
  { name: "WhiteSmoke", rgb: { r: 245, g: 245, b: 245 } },
  { name: "GhostWhite", rgb: { r: 248, g: 248, b: 255 } },
  { name: "AliceBlue", rgb: { r: 240, g: 248, b: 255 } },
  { name: "Azure", rgb: { r: 240, g: 255, b: 255 } },
  { name: "MintCream", rgb: { r: 245, g: 255, b: 250 } },
  { name: "Honeydew", rgb: { r: 240, g: 255, b: 240 } },
  { name: "LightYellow", rgb: { r: 255, g: 255, b: 224 } },
  { name: "LemonChiffon", rgb: { r: 255, g: 250, b: 205 } },
  { name: "LightGoldenRodYellow", rgb: { r: 250, g: 250, b: 210 } },
  { name: "PapayaWhip", rgb: { r: 255, g: 239, b: 213 } },
  { name: "Moccasin", rgb: { r: 255, g: 228, b: 181 } },
  { name: "PeachPuff", rgb: { r: 255, g: 218, b: 185 } },
  { name: "PaleGoldenRod", rgb: { r: 238, g: 232, b: 170 } },
  { name: "DarkKhaki", rgb: { r: 189, g: 183, b: 107 } },
  { name: "GoldenRod", rgb: { r: 218, g: 165, b: 32 } },
  { name: "DarkGoldenRod", rgb: { r: 184, g: 134, b: 11 } },
  { name: "Peru", rgb: { r: 205, g: 133, b: 63 } },
  { name: "RosyBrown", rgb: { r: 188, g: 143, b: 143 } },
  { name: "IndianRed", rgb: { r: 205, g: 92, b: 92 } },
  { name: "LightCoral", rgb: { r: 240, g: 128, b: 128 } },
  { name: "DarkSalmon", rgb: { r: 233, g: 150, b: 122 } },
  { name: "LightSalmon", rgb: { r: 255, g: 160, b: 122 } },
  { name: "PaleVioletRed", rgb: { r: 219, g: 112, b: 147 } },
  { name: "MediumVioletRed", rgb: { r: 199, g: 21, b: 133 } },
  { name: "DarkOrchid", rgb: { r: 153, g: 50, b: 204 } },
  { name: "DarkViolet", rgb: { r: 148, g: 0, b: 211 } },
  { name: "BlueViolet", rgb: { r: 138, g: 43, b: 226 } },
  { name: "MediumOrchid", rgb: { r: 186, g: 85, b: 211 } },
  { name: "DarkMagenta", rgb: { r: 139, g: 0, b: 139 } },
  { name: "MediumSlateBlue", rgb: { r: 123, g: 104, b: 238 } },
  { name: "DarkSlateBlue", rgb: { r: 72, g: 61, b: 139 } },
  { name: "LawnGreen", rgb: { r: 124, g: 252, b: 0 } },
  { name: "MediumSpringGreen", rgb: { r: 0, g: 250, b: 154 } },
  { name: "MediumAquamarine", rgb: { r: 102, g: 205, b: 170 } },
  { name: "DarkSeaGreen", rgb: { r: 143, g: 188, b: 143 } },
  { name: "LightSeaGreen", rgb: { r: 32, g: 178, b: 170 } },
  { name: "DarkCyan", rgb: { r: 0, g: 139, b: 139 } },
  { name: "MediumTurquoise", rgb: { r: 72, g: 209, b: 204 } },
  { name: "DarkTurquoise", rgb: { r: 0, g: 206, b: 209 } },
  { name: "PaleTurquoise", rgb: { r: 175, g: 238, b: 238 } },
  { name: "PowderBlue", rgb: { r: 176, g: 224, b: 230 } },
  { name: "LightBlue", rgb: { r: 173, g: 216, b: 230 } },
  { name: "LightSkyBlue", rgb: { r: 135, g: 206, b: 250 } },
  { name: "SkyBlue", rgb: { r: 135, g: 206, b: 235 } },
  { name: "CadetBlue", rgb: { r: 95, g: 158, b: 160 } },
  { name: "LightSteelBlue", rgb: { r: 176, g: 196, b: 222 } },
  { name: "SlateGray", rgb: { r: 112, g: 128, b: 144 } },
  { name: "LightSlateGray", rgb: { r: 119, g: 136, b: 153 } },
  { name: "DarkSlateGray", rgb: { r: 47, g: 79, b: 79 } },
  { name: "DimGray", rgb: { r: 105, g: 105, b: 105 } },
  { name: "LightGray", rgb: { r: 211, g: 211, b: 211 } },
  { name: "DarkGray", rgb: { r: 169, g: 169, b: 169 } },
  { name: "Gainsboro", rgb: { r: 220, g: 220, b: 220 } },
  { name: "NavajoWhite", rgb: { r: 255, g: 222, b: 173 } },
  { name: "OliveDrab", rgb: { r: 107, g: 142, b: 35 } },
  { name: "YellowGreen", rgb: { r: 154, g: 205, b: 50 } },
  { name: "DarkOliveGreen", rgb: { r: 85, g: 107, b: 47 } },
  { name: "LightGreen", rgb: { r: 144, g: 238, b: 144 } },
  { name: "PaleGreen", rgb: { r: 152, g: 251, b: 152 } },
  { name: "MediumSeaGreen", rgb: { r: 60, g: 179, b: 113 } },
  { name: "LightCyan", rgb: { r: 224, g: 255, b: 255 } },
  { name: "LightPink", rgb: { r: 255, g: 182, b: 193 } },
];

function colorDistance(a: RGB, b: RGB): number {
  // Weighted Euclidean distance (human perception)
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

export function closestColorName(rgb: RGB): string {
  let minDist = Infinity;
  let name = "Unknown";

  for (const c of NAMED_COLORS) {
    const d = colorDistance(rgb, c.rgb);
    if (d < minDist) {
      minDist = d;
      name = c.name;
    }
  }

  return name;
}
