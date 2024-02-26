import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { db } from "../utils/db";

export default {
  data: new SlashCommandBuilder()
    .setName('check-vouch')
    .setDescription('Checks vouch history for a user')
    .setDefaultMemberPermissions(0)
    .addUserOption(option => option.setName('user')
      .setDescription('The user')
      .setRequired(true)),
  async execute(interaction: CommandInteraction<CacheType>) {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    const user = options.getUser('user');
    const vouches = await db.query.vouches.findMany({
      where: (vouches, { eq }) => (eq(vouches.targetId, user?.id ?? ""))
    })
    const out = vouches.map((e) => `${e.vouchType}`)
    await interaction.reply(`${out.join("\n")}`);
  }
}
