import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "text-diff";

export default function Image() {
  return generateToolOgImage("text-diff");
}
