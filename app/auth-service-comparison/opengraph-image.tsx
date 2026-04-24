import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "auth-service-comparison";

export default function Image() {
  return generateToolOgImage("auth-service-comparison");
}
