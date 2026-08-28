import "dotenv/config";

const { DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN } = process.env;

if (!DISCORD_APPLICATION_ID || !DISCORD_BOT_TOKEN) {
  throw new Error("Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN in .env");
}

const commands = [
  {
    name: "crosshair",
    description: "VALORANTのクロスヘアを取得する",
    options: [
      {
        name: "random",
        description: "ランダムなクロスヘアを1つ取得する",
        type: 1, // SUB_COMMAND
      },
      {
        name: "pro",
        description: "プロ選手のクロスヘアを取得する",
        type: 1, // SUB_COMMAND
        options: [
          {
            name: "player",
            description: "選手名",
            type: 3, // STRING
            required: true,
          },
        ],
      },
      {
        name: "gear",
        description: "プロ選手の感度・使用デバイスを取得する",
        type: 1, // SUB_COMMAND
        options: [
          {
            name: "player",
            description: "選手名",
            type: 3, // STRING
            required: true,
          },
          {
            name: "info",
            description: "表示する情報(未指定なら両方)",
            type: 3, // STRING
            required: false,
            choices: [
              { name: "感度", value: "sensitivity" },
              { name: "デバイス", value: "device" },
              { name: "感度・デバイス両方", value: "both" },
            ],
          },
        ],
      },
    ],
  },
];

const res = await fetch(
  `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  }
);

if (!res.ok) {
  throw new Error(`Failed to register commands: ${res.status} ${await res.text()}`);
}

console.log("Slash commands registered successfully.");
