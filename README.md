# VALORANT Crosshair Gallery + Discord Bot

## ディレクトリ構成

```
valo-crosshair-web_dis_app/
├── apps/
│   ├── bot/                  # Discord Bot (Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── index.ts          # fetchハンドラ / ルーティング
│   │   │   ├── verify.ts         # Discordリクエスト署名検証
│   │   │   ├── types.ts          # Env(Workers Bindings)型
│   │   │   ├── lib/discord.ts    # Discord Interaction型・定数
│   │   │   └── commands/crosshair.ts
│   │   ├── scripts/register-commands.ts  # スラッシュコマンド登録
│   │   ├── wrangler.toml
│   │   ├── .dev.vars.example     # wrangler dev用ローカル変数
│   │   └── .env.example          # register-commands.ts用
│   └── web/                  # Next.js ギャラリー本体 (Cloudflare Pagesにデプロイ済み)
├── packages/
│   └── shared/src/types.ts   # Crosshair型など共通定義
├── scripts/
│   └── seed-firestore/       # Firestoreへのモックデータ投入
│       ├── seed.ts
│       ├── mock-data.json
│       └── .env.example
└── .gitignore
```

## ステップ1: Firebase初期設定 + モックデータ投入

1. https://console.firebase.google.com でプロジェクトを新規作成（Sparkプラン=無料枠）
2. 「Firestore Database」を有効化（本番モードでOK。リージョンは `asia-northeast1` 推奨）
3. 「プロジェクトの設定 > サービスアカウント」から秘密鍵(JSON)を生成
4. `scripts/seed-firestore/.env.example` を `.env` にコピーし、JSONの値を転記

```bash
cd scripts/seed-firestore
cp .env.example .env
npm install
npm run seed
```

これで `crosshairs` コレクションに `mock-data.json` の内容が投入されます。

### Firestore Security Rulesのデプロイ(必須)

`firestore.rules` に「承認済み(`status == "approved"`)の投稿のみ公開読み取り可能、
書き込みはクライアントSDKから常に禁止」というルールを定義している。デフォルトのままだと
Firebaseコンソールで別途設定しない限りルールが反映されないため、必ずデプロイすること。

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules --project <FIREBASE_PROJECT_ID>
```

### 既存データの移行(ルール導入前に投入済みのデータがある場合は必須)

新ルールでは `status` フィールドが無いドキュメントは非公開扱いになる。ルール導入前から
運用していた場合は、`scripts/seed-firestore` で以下を実行し、`status`未設定のドキュメントに
一括で `status: "approved"` を付与する(既に`status`があるものは変更しない)。

```bash
cd scripts/seed-firestore
npm run migrate:approve-legacy          # まずドライラン(書き込みなし)で対象を確認
npm run migrate:approve-legacy -- --apply   # 確認後、実際に反映
```

## ステップ1.5: 投稿モデレーション

ユーザー投稿(`/submit`)は `status: "pending"` で保存され、`status: "approved"` になるまで
ギャラリー・検索・サイトマップ・Discord Botのどこにも表示されない。承認/却下は `/admin` ページ
(`https://<デプロイ先>/admin`)から行う。

1. Cloudflare Pagesの環境変数に `ADMIN_SECRET`(任意の推測されにくい文字列)を設定する
2. `/admin` にアクセスし、そのシークレットを入力してログイン
3. 承認待ちの投稿を確認し、「承認」または「却下」を選択

`ADMIN_SECRET` はヘッダー照合による簡易的な保護であり、Basic認証やSSOの代替ではない点に注意
（社内向け・小規模運用を想定）。定期的なローテーションを推奨する。

### 投稿のレート制限(任意・推奨)

`functions/api/submit.ts` はCloudflare KVネームスペース `RATE_LIMIT_KV` がバインドされていれば、
同一IPからの投稿を1時間あたり5件までに制限する。未設定でも投稿機能自体は動作する(制限なし)。

1. Cloudflareダッシュボード「Workers & Pages > KV」でネームスペースを作成
2. 対象のPagesプロジェクトの「Settings > Functions > KV namespace bindings」で
   変数名 `RATE_LIMIT_KV` として上記ネームスペースをバインド

## ステップ2: Discord Bot (Cloudflare Workers) セットアップ

1. https://discord.com/developers/applications でアプリケーションを新規作成
2. 「General Information」から `Public Key` と `Application ID` を取得
3. 「Bot」タブでBotを作成し、Tokenを取得
4. ローカル動作確認用に `.dev.vars` を作成

```bash
cd apps/bot
cp .dev.vars.example .dev.vars
cp .env.example .env
npm install
```

5. スラッシュコマンドを登録（`.env` の DISCORD_APPLICATION_ID / DISCORD_BOT_TOKEN を使用）

```bash
npm run register-commands
```

6. ローカルで起動し、`wrangler dev` が発行するURL (or `cloudflared tunnel` 等で公開したURL) を
   Discord Developer Portalの「Interactions Endpoint URL」に設定

```bash
npm run dev
```

7. 動作確認後、本番Secretsを登録してデプロイ

```bash
wrangler secret put DISCORD_PUBLIC_KEY
wrangler secret put DISCORD_APPLICATION_ID
wrangler secret put DISCORD_BOT_TOKEN
npm run deploy
```

デプロイ後に発行されるWorkers URL (`https://valo-crosshair-bot.<subdomain>.workers.dev`) を
Discord Developer Portalの「Interactions Endpoint URL」に設定すれば疎通確認完了です。

## 環境変数一覧

| 変数名 | 用途 | 設定先 |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK認証 | `scripts/seed-firestore/.env` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK認証 | `scripts/seed-firestore/.env` |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK認証 | `scripts/seed-firestore/.env` |
| `DISCORD_PUBLIC_KEY` | Interactionsの署名検証 | `apps/bot/.dev.vars` (本番は `wrangler secret`) |
| `DISCORD_APPLICATION_ID` | コマンド登録・API呼び出し | `apps/bot/.env`, `apps/bot/.dev.vars` (本番は `wrangler secret`) |
| `DISCORD_BOT_TOKEN` | コマンド登録・API呼び出し | `apps/bot/.env`, `apps/bot/.dev.vars` (本番は `wrangler secret`) |
| `ADMIN_SECRET` | `/admin` ページ・承認APIの認証 | Cloudflare Pages環境変数(Encrypted推奨) |
| `RATE_LIMIT_KV` | 投稿のレート制限(任意) | Cloudflare Pages KV namespace binding |
| `TURNSTILE_SECRET_KEY` | 投稿フォームのBot対策 | Cloudflare Pages環境変数(Encrypted) |

## 現在の状況

- `apps/web`: Next.js製ギャラリーサイト。https://valorant-crosshair-hub.pages.dev にデプロイ済み
  （ホーム / ギャラリー検索 / クロスヘアビルダー / プロ選手設定 / カテゴリ / 投稿フォーム / 管理(`/admin`) 等）
- `apps/bot`: Discord Bot。`/crosshair random` `/crosshair pro` コマンドでFirestoreの実データ(承認済みのみ)を返す
- CI: `.github/workflows/ci.yml` でPR/main pushごとにlint・build(web)、typecheck(bot)を自動実行
- 未対応: Cloudflare R2バケットでの画像アップロード導線（現状はSVGをその場で描画する方式で運用）
