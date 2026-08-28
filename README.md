# VALORANT Crosshair Gallery + Discord Bot (MVP)

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
│   └── web/                  # Next.js (Step3以降で実装、Cloudflare Pages)
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

## 次のステップ (未実装)

- `apps/bot/src/commands/crosshair.ts` のFirestore実データ連携（現状はサンプル固定値を返す）
- `apps/web` のNext.jsギャラリーUI実装 + Cloudflare Pagesデプロイ
- Cloudflare R2バケット作成・画像アップロード導線
