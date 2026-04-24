import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "dummy-text";

export default function Image() {
  return generateToolOgImage("dummy-text");
}
