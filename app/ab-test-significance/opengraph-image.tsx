import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "ab-test-significance";

export default function Image() {
  return generateToolOgImage("ab-test-significance");
}
