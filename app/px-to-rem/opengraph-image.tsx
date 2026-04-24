import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "px-to-rem";

export default function Image() {
  return generateToolOgImage("px-to-rem");
}
