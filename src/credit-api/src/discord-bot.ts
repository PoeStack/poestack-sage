import { REST, Routes } from "discord.js";
import { client, clientId, guildId, token } from "./utils/constants";
import { loadBotCommands } from "./utils/command-utils";

const loadedCommands = loadBotCommands()

const rest = new REST().setToken(token);
rest.put(
  Routes.applicationGuildCommands(clientId, guildId),
  { body: loadedCommands.commandsJson },
);

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return
  const command: any = loadedCommands.commandCollection.get(interaction.commandName)
  console.log("loaded command", command)
  await command.execute(interaction)
});

client.login(token);
