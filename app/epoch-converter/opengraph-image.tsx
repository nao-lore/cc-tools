import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "epoch-converter";

export default function Image() {
  return generateToolOgImage("epoch-converter");
}
