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
