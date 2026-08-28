import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface MockCrosshair {
  id: string;
  name: string;
  code: string;
  category: "pro" | "meme" | "practical";
  proPlayerName: string | null;
  tags: string[];
  imageUrl: string;
  createdAt: string;
}

function loadServiceAccount() {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env"
    );
  }

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    // .env stores the key with literal \n sequences; convert back to real newlines.
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

async function main() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadServiceAccount()) });
  }

  const db = getFirestore();
  const mockDataPath = join(__dirname, "mock-data.json");
  const crosshairs: MockCrosshair[] = JSON.parse(readFileSync(mockDataPath, "utf-8"));

  const batch = db.batch();
  for (const crosshair of crosshairs) {
    const ref = db.collection("crosshairs").doc(crosshair.id);
    batch.set(ref, crosshair, { merge: true });
  }

  await batch.commit();
  console.log(`Seeded ${crosshairs.length} crosshairs into Firestore.`);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
