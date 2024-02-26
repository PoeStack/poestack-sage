import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { db } from "../utils/db";
import { violationReasons, violations } from "../utils/constants";
import { schema } from "sage-pg-db";
import { uuid } from "uuidv4";

export default {
  data: new SlashCommandBuilder()
    .setName('add-violation')
    .setDescription('Add violation')
    .setDefaultMemberPermissions(0)
    .addUserOption(option => option.setName('user')
      .setDescription('The user')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Violation reason')
        .addChoices(...violations.map((e) => ({ value: e.name.slice(0, 10), name: e.name.slice(0, 100) })))
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("notes")
        .setDescription("Add a note to the violation")
    ),
  async execute(interaction: CommandInteraction<CacheType>) {
    const { options } = interaction;

    const user = options.getUser('user');

    const reason = options.get('reason')?.value as string;
    const notes = options.get('notes')?.value as string;
    await db.insert(schema.violations).values({
      id: uuid(),
      violationDesc: notes,
      vouchValue: 10,
      targetId: user?.id,
      targetType: "Discord",
      violationType: reason
    }).onConflictDoNothing()

    interaction.reply("Violation added")
  }
}
