import { readdirSync } from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class HelpCommand {
  static config = {
    name: "help",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]help or help [command name]\nChức năng: xem bot có bao nhiêu lệnh or xem hướng dẫn cách dùng của 1 lệnh nào đó",
  };

  constructor(private client) {}

  async run(api: Ifca, event: IEvent, client, args) {
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
      if (!CommandClass) continue;
      const { config } = CommandClass;
      const commandInstance = new CommandClass(this.client);
      if (args[1] == config.name) {
        api.sendMessage(
          `------${config.name}-------\n${config.description}`,
          event.threadID
        );
      }
      if (commandInstance.run) {
        commandCount++;
        msgPrefix += `${config.name}, `;
      }
      if (commandInstance.noprefix) {
        noprefixCount++;
        msgNpPrefix += `${config.name}, `;
      }
    }

    if (!args[1]) {
      api.sendMessage(
        `-------HELP-------\nThis is a Facebook chat message. Currently, this bot has ${commandCount + noprefixCount} commands\n\n${commandCount} commands has prefix : ${msgPrefix}\n\n${noprefixCount} no prefix: ${msgNpPrefix}`,
        event.threadID
      );
    }
  }
}
