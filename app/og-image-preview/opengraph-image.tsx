import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "og-image-preview";

export default function Image() {
  return generateToolOgImage("og-image-preview");
}
