import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "jigyou-keihi-bunrui";

export default function Image() {
  return generateToolOgImage("jigyou-keihi-bunrui");
}
