// Firestore Security Rules(status == "approved"のみ公開読み取り可)を導入する前に
// 投入されていたドキュメントには`status`フィールドが無く、新ルールでは非表示になってしまう。
// このスクリプトは`status`が未設定のドキュメントにのみ`status: "approved"`を付与する
// (新ルール導入前は事実上すべて公開済みだったため、既存データは無条件で承認扱いにする)。
// 既に`status`が設定済みのドキュメント(導入後に投稿されたpending/approved)は変更しない。
import "dotenv/config";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DRY_RUN = !process.argv.includes("--apply");

function loadServiceAccount() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env"
    );
  }

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

async function main() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadServiceAccount()) });
  }

  const db = getFirestore();
  const snapshot = await db.collection("crosshairs").get();

  const targets = snapshot.docs.filter((doc) => !("status" in doc.data()));

  console.log(`対象ドキュメント: ${targets.length} / 全${snapshot.size}件(statusフィールド無し)`);

  if (DRY_RUN) {
    console.log("(--applyを付けずに実行したためドライラン。実際の書き込みは行っていません)");
    for (const doc of targets) {
      console.log(` - ${doc.id}`);
    }
    return;
  }

  if (targets.length === 0) {
    console.log("更新対象はありません。");
    return;
  }

  // Firestoreの1バッチあたり上限(500件)に収まるようチャンク分割する。
  const CHUNK_SIZE = 400;
  for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
    const chunk = targets.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();
    for (const doc of chunk) {
      batch.update(doc.ref, { status: "approved" });
    }
    await batch.commit();
  }

  console.log(`${targets.length}件のドキュメントに status: "approved" を付与しました。`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
