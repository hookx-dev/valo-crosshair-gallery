export type CrosshairCategory = "pro" | "meme" | "practical";

export interface Crosshair {
  id: string;
  name: string;
  code: string;
  category: CrosshairCategory;
  proPlayerName: string | null;
  submittedBy: string | null;
  tags: string[];
  status: "pending" | "approved";
  createdAt: string;
}

export interface GearItem {
  category: string;
  name: string;
  affiliateUrl: string;
}

export interface ProGearProfile {
  slug: string;
  playerName: string;
  team: string;
  role: string;
  sensitivity: number;
  dpi: number;
  crosshairId: string;
  gear: GearItem[];
}
