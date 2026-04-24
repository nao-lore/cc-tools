import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "measuring-converter";

export default function Image() {
  return generateToolOgImage("measuring-converter");
}
