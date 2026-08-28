import { verifyDiscordRequest } from "./verify";
import { handleCrosshairCommand } from "./commands/crosshair";
import { InteractionResponseType, InteractionType, type DiscordInteraction } from "./lib/discord";
import type { Env } from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Discord Interactions Endpoint", { status: 200 });
    }

    const signature = request.headers.get("X-Signature-Ed25519");
    const timestamp = request.headers.get("X-Signature-Timestamp");
    const rawBody = await request.text();

    const isValid = await verifyDiscordRequest(
      rawBody,
      signature,
      timestamp,
      env.DISCORD_PUBLIC_KEY
    );
    if (!isValid) {
      return new Response("Invalid request signature", { status: 401 });
    }

    const interaction = JSON.parse(rawBody) as DiscordInteraction;

    if (interaction.type === InteractionType.PING) {
      return Response.json({ type: InteractionResponseType.PONG });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      switch (interaction.data?.name) {
        case "crosshair":
          return handleCrosshairCommand(interaction, env);
        default:
          return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "未対応のコマンドです。" },
          });
      }
    }

    return new Response("Unhandled interaction type", { status: 400 });
  },
} satisfies ExportedHandler<Env>;
