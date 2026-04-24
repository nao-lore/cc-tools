import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "qr-generator";

export default function Image() {
  return generateToolOgImage("qr-generator");
}
