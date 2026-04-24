import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "tsumitate-sim";

export default function Image() {
  return generateToolOgImage("tsumitate-sim");
}
