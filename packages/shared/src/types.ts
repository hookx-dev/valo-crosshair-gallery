export type CrosshairCategory = "pro" | "meme" | "practical";

export interface Crosshair {
  id: string;
  name: string;
  code: string;
  category: CrosshairCategory;
  proPlayerName: string | null;
  submittedBy: string | null;
  tags: string[];
  imageUrl: string;
  createdAt: string;
}
