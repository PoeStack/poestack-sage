import fs from "fs"
import path from "path"
import { Collection } from "discord.js";

export function loadBotCommands() {
  const commandsJson = []
  const commandCollection = new Collection()

  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath)?.default;
    console.log("command loaded", command)
    if ('data' in command && 'execute' in command) {
      commandsJson.push(command.data.toJSON())
      commandCollection.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  return {
    commandsJson: commandsJson,
    commandCollection: commandCollection
  }
}
