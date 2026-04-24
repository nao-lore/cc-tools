import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "menseki-keisan";

export default function Image() {
  return generateToolOgImage("menseki-keisan");
}
