import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "http-status";

export default function Image() {
  return generateToolOgImage("http-status");
}
