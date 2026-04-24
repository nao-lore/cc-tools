import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "json-to-csv";

export default function Image() {
  return generateToolOgImage("json-to-csv");
}
