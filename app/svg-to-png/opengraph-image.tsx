import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "svg-to-png";

export default function Image() {
  return generateToolOgImage("svg-to-png");
}
