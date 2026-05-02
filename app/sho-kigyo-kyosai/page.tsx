import type { Metadata } from "next";
import ToolPage from "@/tools/sho-kigyo-kyosai/page";

export const metadata: Metadata = {
  title: "小規模企業共済 節税計算 — 掛金×節税効果×解約時手取りを一画面で",
  description: "小規模企業共済の節税額を即計算。月額1,000〜70,000円の掛金から所得税+住民税の節税効果を算出。解約時の手取り（任意解約/廃業解約）シミュレーション付き。",
  alternates: { canonical: "https://tools.loresync.dev/sho-kigyo-kyosai" },
};

export default function Page() {
  return <ToolPage />;
}
