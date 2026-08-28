import type { Env } from "../types";
import { InteractionResponseType, type DiscordInteraction } from "../lib/discord";
import { fetchAllCrosshairs, type Crosshair } from "../lib/firestore";

const SITE_BASE_URL = "https://valorant-crosshair-hub.pages.dev";

function toEmbedResponse(crosshair: Crosshair) {
  const detailUrl = `${SITE_BASE_URL}/crosshairs/${crosshair.id}`;
  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [
        {
          title: crosshair.name,
          description: `インポートコード:\n\`\`\`${crosshair.code}\`\`\``,
          url: detailUrl,
        },
      ],
      content: `詳細ページ: ${detailUrl}`,
    },
  });
}

function toMessageResponse(content: string) {
  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content },
  });
}

export async function handleCrosshairCommand(
  interaction: DiscordInteraction,
  env: Env
): Promise<Response> {
  const subcommand = interaction.data?.options?.[0]?.name ?? "random";
  const proPlayerOption = interaction.data?.options?.[0]?.options?.find(
    (opt) => opt.name === "player"
  );

  let crosshairs: Crosshair[];
  try {
    crosshairs = await fetchAllCrosshairs(env.FIREBASE_PROJECT_ID);
  } catch {
    return toMessageResponse("クロスヘアの取得に失敗しました。時間をおいて再度お試しください。");
  }

  if (subcommand === "pro") {
    const query = String(proPlayerOption?.value ?? "").toLowerCase();
    const match = crosshairs.find(
      (c) => c.category === "pro" && c.proPlayerName?.toLowerCase().includes(query)
    );
    if (!match) {
      return toMessageResponse(`「${proPlayerOption?.value ?? ""}」に一致するプロ選手のクロスヘアが見つかりませんでした。`);
    }
    return toEmbedResponse(match);
  }

  if (crosshairs.length === 0) {
    return toMessageResponse("クロスヘアが見つかりませんでした。");
  }
  const random = crosshairs[Math.floor(Math.random() * crosshairs.length)];
  return toEmbedResponse(random);
}
