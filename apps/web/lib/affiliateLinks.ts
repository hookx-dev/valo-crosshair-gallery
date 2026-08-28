// Amazonアソシエイトのトラッキングタグ。取得後にこの値だけ差し替えれば全リンクに反映される。
export const AMAZON_ASSOCIATE_TAG = "valocrosshair-22";

// 商品ページの正確なASIN管理はコストが高く、プロ選手の限定モデル等はAmazon上の該当ページが
// 変わりやすいため、商品名でのAmazon検索結果ページへのリンクを採用する(検索連動型アフィリエイト)。
export function amazonSearchUrl(query: string): string {
  const params = new URLSearchParams({ k: query, tag: AMAZON_ASSOCIATE_TAG });
  return `https://www.amazon.co.jp/s?${params.toString()}`;
}
