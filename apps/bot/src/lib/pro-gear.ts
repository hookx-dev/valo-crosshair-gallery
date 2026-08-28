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

export async function fetchProGearProfiles(siteBaseUrl: string): Promise<ProGearProfile[]> {
  const res = await fetch(`${siteBaseUrl}/api/pro-gear`);
  if (!res.ok) {
    throw new Error(`Failed to fetch pro gear: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
