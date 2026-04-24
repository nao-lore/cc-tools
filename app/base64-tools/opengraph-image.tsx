import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "base64-tools";

export default function Image() {
  return generateToolOgImage("base64-tools");
}
