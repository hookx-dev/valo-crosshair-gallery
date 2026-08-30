import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Crosshair, CrosshairCategory } from "@/types";

const COLLECTION = "crosshairs";

export async function getAllCrosshairs(): Promise<Crosshair[]> {
  const q = query(collection(db, COLLECTION), where("status", "==", "approved"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as Crosshair);
}

export async function getCrosshairsByCategory(category: CrosshairCategory): Promise<Crosshair[]> {
  const q = query(
    collection(db, COLLECTION),
    where("category", "==", category),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as Crosshair);
}

export async function getCrosshairById(id: string): Promise<Crosshair | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  const crosshair = snap.data() as Crosshair;
  return crosshair.status === "approved" ? crosshair : null;
}
