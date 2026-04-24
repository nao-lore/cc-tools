import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "loan-simulator";

export default function Image() {
  return generateToolOgImage("loan-simulator");
}
