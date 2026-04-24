import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "chmod-calculator";

export default function Image() {
  return generateToolOgImage("chmod-calculator");
}
