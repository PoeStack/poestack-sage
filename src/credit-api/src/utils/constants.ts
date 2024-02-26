import { Client, Collection, GatewayIntentBits } from "discord.js";

export const token = process.env['DISCORD_BOT_TOKEN'] as string;
export const clientId = '1201653656038940672';
export const guildId = '1200953296177873056';

export const vouchReasons = ['5-way', 'boss carry', 'bench craft', 'other'];


export const violations = [
  { name: "Successful scam with Hard Evidence", points: 100 },
  { name: "Scam attempt with Hard Evidence", points: 50 },
  { name: "Successful scam with Soft Evidence", points: 15 },
  { name: "Scam attempt with Soft Evidence", points: 10 },

  { name: "Participating in or encouraging: doxing, swatting, death threats, targetted harassment, sexual harassment", points: 400 },
  { name: "Racism, sexism, hateful conduct", points: 50 },
  { name: "NSFW, nudity, pornography, extreme violence, gore and other sexual content and obscene conduct", points: 50 },
  { name: "No discussions relating to politics, religion, and nationality, sexuality, and intimacy", points: 10 },
  { name: "Keep self promotion to the services you provide, in the designated channels", points: 10 },
]


export const violationReasons = ['sucessfull scam: hard evidence'];

export const DISCORD_COMMANDS = new Collection()

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

