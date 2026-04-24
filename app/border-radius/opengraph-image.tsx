import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "border-radius";

export default function Image() {
  return generateToolOgImage("border-radius");
}
