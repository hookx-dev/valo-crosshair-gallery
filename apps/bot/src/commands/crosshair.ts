import type { Env } from "../types";
import { InteractionResponseType, type DiscordInteraction } from "../lib/discord";
import { fetchAllCrosshairs, type Crosshair } from "../lib/firestore";
import { fetchProGearProfiles, type ProGearProfile } from "../lib/pro-gear";

const SITE_BASE_URL = "https://valorant-crosshair-hub.pages.dev";

function toEmbedResponse(crosshair: Crosshair) {
  const detailUrl = `${SITE_BASE_URL}/crosshairs/${crosshair.id}`;
  const imageUrl = `${SITE_BASE_URL}/api/crosshair-image?code=${encodeURIComponent(crosshair.code)}`;
  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [
        {
          title: crosshair.name,
          description: `インポートコード:\n\`\`\`${crosshair.code}\`\`\``,
          url: detailUrl,
          image: { url: imageUrl },
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

function toGearEmbedResponse(profile: ProGearProfile, info: string) {
  const detailUrl = `${SITE_BASE_URL}/pro/${profile.slug}`;
  const fields = [];

  if (info === "sensitivity" || info === "both") {
    fields.push({
      name: "感度",
      value: `Sensitivity: ${profile.sensitivity} / DPI: ${profile.dpi}`,
    });
  }
  if (info === "device" || info === "both") {
    fields.push({
      name: "使用デバイス",
      value: profile.gear.map((g) => `**${g.category}**: [${g.name}](${g.affiliateUrl})`).join("\n"),
    });
  }

  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [
        {
          title: `${profile.playerName} (${profile.team} / ${profile.role})`,
          url: detailUrl,
          fields,
        },
      ],
      content: `詳細ページ: ${detailUrl}`,
    },
  });
}

export async function handleCrosshairCommand(
  interaction: DiscordInteraction,
  env: Env
): Promise<Response> {
  const subcommand = interaction.data?.options?.[0]?.name ?? "random";
  const subOptions = interaction.data?.options?.[0]?.options;
  const proPlayerOption = subOptions?.find((opt) => opt.name === "player");

  if (subcommand === "gear") {
    const query = String(proPlayerOption?.value ?? "").toLowerCase();
    const info = String(subOptions?.find((opt) => opt.name === "info")?.value ?? "both");

    let profiles: ProGearProfile[];
    try {
      profiles = await fetchProGearProfiles(SITE_BASE_URL);
    } catch {
      return toMessageResponse("感度・デバイス情報の取得に失敗しました。時間をおいて再度お試しください。");
    }

    const match = profiles.find((p) => p.playerName.toLowerCase().includes(query));
    if (!match) {
      return toMessageResponse(`「${proPlayerOption?.value ?? ""}」に一致するプロ選手が見つかりませんでした。`);
    }
    return toGearEmbedResponse(match, info);
  }

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
