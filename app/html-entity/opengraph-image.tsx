import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "html-entity";

export default function Image() {
  return generateToolOgImage("html-entity");
}
