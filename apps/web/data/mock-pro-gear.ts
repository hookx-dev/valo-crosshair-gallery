import type { ProGearProfile } from "@/types";

// アフィリエイトページのモック。選手名・製品名はすべて架空のサンプルで、
// affiliateUrl は実際のリンクが決まるまでのプレースホルダー("#")。
export const mockProGear: ProGearProfile[] = [
  {
    slug: "sample-player-a",
    playerName: "Sample Player A",
    team: "Sample Esports",
    role: "Duelist",
    sensitivity: 0.35,
    dpi: 800,
    crosshairId: "sample-pro-001",
    gear: [
      { category: "マウス", name: "Sample Gaming Mouse X1", affiliateUrl: "#" },
      { category: "マウスパッド", name: "Sample Pad Speed M", affiliateUrl: "#" },
      { category: "キーボード", name: "Sample Mini Keyboard 60%", affiliateUrl: "#" },
      { category: "ヘッドセット", name: "Sample Headset Pro", affiliateUrl: "#" },
      { category: "モニター", name: "Sample 240Hz Monitor 24.5inch", affiliateUrl: "#" },
    ],
  },
  {
    slug: "sample-player-b",
    playerName: "Sample Player B",
    team: "Sample Gaming",
    role: "Sentinel",
    sensitivity: 0.28,
    dpi: 1600,
    crosshairId: "sample-pro-002",
    gear: [
      { category: "マウス", name: "Sample Lightweight Mouse Z2", affiliateUrl: "#" },
      { category: "マウスパッド", name: "Sample Pad Control L", affiliateUrl: "#" },
      { category: "キーボード", name: "Sample TKL Keyboard", affiliateUrl: "#" },
      { category: "ヘッドセット", name: "Sample Wireless Headset", affiliateUrl: "#" },
      { category: "モニター", name: "Sample 360Hz Monitor 27inch", affiliateUrl: "#" },
    ],
  },
];
