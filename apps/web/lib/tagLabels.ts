// クロスヘアのtags(検索用の内部値)を画面表示用の日本語ラベルに変換する。
const TAG_LABELS: Record<string, string> = {
  pro: "プロ",
  meme: "ネタ",
  practical: "実用",
  green: "グリーン",
  small: "小",
  cyan: "シアン",
  dot: "ドット",
  pink: "ピンク",
  red: "レッド",
  classic: "クラシック",
  white: "ホワイト",
  thin: "細い",
  yellowgreen: "黄緑",
  cross: "十字",
  yellow: "イエロー",
  wide: "幅広",
  huge: "巨大",
  colorful: "カラフル",
  eyes: "目玉",
  particle: "パーティクル",
  experimental: "実験的",
  dual: "デュアル",
  minimal: "ミニマル",
  precise: "精密",
  visible: "視認性",
  outline: "アウトライン",
  contrast: "コントラスト",
  tiny: "極小",
};

export function translateTag(tag: string): string {
  return TAG_LABELS[tag.toLowerCase()] ?? tag;
}
