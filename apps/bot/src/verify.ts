import { verifyKey } from "discord-interactions";

export async function verifyDiscordRequest(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  publicKey: string
): Promise<boolean> {
  if (!signature || !timestamp) {
    return false;
  }

  try {
    return await verifyKey(rawBody, signature, timestamp, publicKey);
  } catch {
    return false;
  }
}
