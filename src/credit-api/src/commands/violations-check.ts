import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { db } from "../utils/db";
import { schema } from "sage-pg-db";
import { eq, sum } from "drizzle-orm";

export default {
  data: new SlashCommandBuilder()
    .setName('violations-check')
    .setDescription('Checks vouch history for a user')
    .setDefaultMemberPermissions(0)
    .addUserOption(option => option.setName('user')
      .setDescription('The user')
      .setRequired(true)),
  async execute(interaction: CommandInteraction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { commandName, options } = interaction;
    const user = options.getUser('user');
    const vouches = await db.query.violations.findMany({
      where: (vouches, { eq }) => (eq(vouches.targetId, user?.id ?? ""))
    })

    const x = await db.select(
      { value: sum(schema.violations.vouchValue).mapWith(Number) }
    ).from(schema.vouches)
      .where(
        eq(schema.vouches.targetId, user?.id ?? "")
      )

    const out = vouches.map((e) => `${e.violationType} ${e.violationDesc}`)
    await interaction.reply(`${out.join("\n")}`);
  }
}
