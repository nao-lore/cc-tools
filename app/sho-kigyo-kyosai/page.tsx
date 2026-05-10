import type { Metadata } from "next";
import ToolPage from "@/tools/sho-kigyo-kyosai/page";

export const metadata: Metadata = {
  title: "小規模企業共済 節税計算 - 掛金控除による所得税・住民税の軽減額",
  description: "小規模企業共済の掛金控除による節税額を、月額掛金、課税所得、支払月数から概算。所得税・復興特別所得税・住民税と実質負担を表示します。",
  alternates: { canonical: "https://tools.loresync.dev/sho-kigyo-kyosai" },
};

export default function Page() {
  return <ToolPage />;
}
