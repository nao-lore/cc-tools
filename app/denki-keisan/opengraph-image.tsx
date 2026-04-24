import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "denki-keisan";

export default function Image() {
  return generateToolOgImage("denki-keisan");
}
