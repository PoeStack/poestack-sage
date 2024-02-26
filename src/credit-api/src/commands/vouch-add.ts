import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { schema } from "sage-pg-db";
import { client, guildId, vouchReasons } from "../utils/constants";
import { uuid } from "uuidv4";
import { db } from "../utils/db";
import { count, eq, sum } from "drizzle-orm";

export default {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Vouch a user')
    .setDefaultMemberPermissions(0)
    .addUserOption(option => option.setName('user')
      .setDescription('The user')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Vouch reason')
        .addChoices(...vouchReasons.map((e) => ({ value: e, name: e })))
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction<CacheType>) {
    const { commandName, options } = interaction;
    const sender = interaction.user
    const user = options.getUser('user');
    const reason = options.get('reason')?.value as string;
    console.log("vouch with reason", reason)

    await db.insert(schema.vouches).values({
      id: uuid(),
      sourceType: "Discord",
      sourceId: sender.id,
      targetType: "Discord",
      targetId: user?.id,
      vouchType: reason,
      vouchValue: 10
    }).onConflictDoNothing()

    const x = await db.select(
      { value: sum(schema.vouches.vouchValue).mapWith(Number) }
    ).from(schema.vouches)
      .where(
        eq(schema.vouches.targetId, user?.id ?? "")
      )

    const totalVouches = x?.[0]?.value ?? 0
    const serverRoles = [
      { roleId: "1200965494774173836", threshold: 500 },
      { roleId: "1200965691487043695", threshold: 1500 },
      { roleId: "1202448639876931624", threshold: 2500 },
      { roleId: "1202448924896395264", threshold: 5000 },
      { roleId: "1202449003552444446", threshold: 10000 }
    ]

    const g = await client.guilds.fetch(guildId)
    const member = await g.members.fetch({ user: user!! })

    for (const r of serverRoles) {
      if (totalVouches >= r.threshold) {
        if (!member.guild.roles.cache.has(r.roleId)) {
          console.log("assigning role")
          await g.members.addRole({ user: user!!, role: r.roleId })
        }
      }
    }

    await interaction.reply(`<@${sender?.id}> vouched for <@${user?.id}> with the reason: ${reason}, total vouches: ${totalVouches}`);
  },
}
