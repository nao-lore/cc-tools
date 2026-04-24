import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "mdtable";

export default function Image() {
  return generateToolOgImage("mdtable");
}
