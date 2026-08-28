import type { Env } from "../types";
import { InteractionResponseType, type DiscordInteraction } from "../lib/discord";

const SITE_BASE_URL = "https://your-site.example.com";

// Firestoreからの実データ取得はStep3で実装する。
// ここでは /crosshair random と /crosshair pro <player> のルーティングのみを確立する。
export async function handleCrosshairCommand(
  interaction: DiscordInteraction,
  _env: Env
): Promise<Response> {
  const subcommand = interaction.data?.options?.[0]?.name ?? "random";
  const proPlayerOption = interaction.data?.options?.[0]?.options?.find(
    (opt) => opt.name === "player"
  );

  const crosshair =
    subcommand === "pro"
      ? {
          name: `Sample Pro Config (${proPlayerOption?.value ?? "unknown"})`,
          code: "0;P;c;1;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0",
          id: "sample-pro-001",
        }
      : {
          name: "Sample Random Config",
          code: "0;P;c;1;h;0;m;1;0l;4;0o;1;0a;1;0f;0;1t;0",
          id: "practical-001",
        };

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
