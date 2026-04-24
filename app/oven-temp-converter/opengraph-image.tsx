import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "oven-temp-converter";

export default function Image() {
  return generateToolOgImage("oven-temp-converter");
}
