import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "aojiro-shinkoku-sim";

export default function Image() {
  return generateToolOgImage("aojiro-shinkoku-sim");
}
