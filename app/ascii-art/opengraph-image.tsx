import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "ascii-art";

export default function Image() {
  return generateToolOgImage("ascii-art");
}
