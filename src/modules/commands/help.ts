import axios from "axios";
import { readdirSync } from "fs";
import { join } from "path";

export default class HelpCommand {
  static config = {
    name: "help",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
  };

  constructor(private client) {}

  async run(api, event, args) {
    const commandPath = join(process.cwd(), "src", "modules", "commands");
    const commandFiles = readdirSync(commandPath).filter((file: string) =>
      file.endsWith(".ts")
    );
    let commandCount = 0;
    let noprefixCount = 0;
    let msgPrefix = "";
    let msgNpPrefix = "";
    for (const file of commandFiles) {
      const filePath = join(commandPath, file);
      const CommandClass = require(filePath).default;
      const { config } = CommandClass;
      const commandInstance = new CommandClass(this.client);
      if (commandInstance.run) {
        commandCount++;
        msgPrefix += `${config.name}, `;
      }
      if (commandInstance.noprefix) {
        noprefixCount++;
        msgNpPrefix += `${config.name}, `;
      }
    }
    api.sendMessage(
      `-------HELP-------\nThis is Facebook chat message, currently this bot has ${commandCount + noprefixCount} commands\n${commandCount} commands has prefix : ${msgPrefix}\n${noprefixCount} no prefix: ${msgNpPrefix}`,
      event.threadID,
      event.messageID
    );
  }
}
