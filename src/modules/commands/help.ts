import { readdirSync } from "fs";
import { join } from "path";

import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class HelpCommand {
  static config = {
    category: "",
    name: "help",
    version: "1.0.0",
    author: "Lợi",

    description: {
      vi: "xem bot có bao nhiêu lệnh or xem hướng dẫn cách dùng của 1 lệnh nào đó",
      en: "see how many commands the bot has or see the instructions for using a certain command",
    },
    guide: {
      vi: "[prefix]help hoặc help [command name]",
      en: "[prefix]help or help [command name]",
    },
  };
  static message = {
    vi: {
      listCommand:
        "-------HELP-------\nThis is a Facebook chat message. Currently, this bot has $0 commands\n\n$1 commands has prefix : $2\n\n$3 no prefix: $4",
      command: "------$0-------\nChức Năng: $1\nCách dùng: $2",
    },
    en: {
      listCommand:
        "-------HELP-------\nThis is a Facebook chat message. Currently, this bot has $0 commands\n\n$1 commands has prefix : $2\n\n$3 no prefix: $4",
      command: "------$0-------\nFunction: $1\nUse: $2",
    },
  };

  constructor(private client) {}

  async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinRun) {
    console.log(global.getLang("Restarting"));
    const CurrentLanguage = process.env.LANGUAGE_CODE || "en";
    const commandPath = join(process.cwd(), "src", "modules", "commands");
    const commandFiles = readdirSync(commandPath).filter((file: string) =>
      file.endsWith(".ts"),
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
        const [description, guide] = [
          config.description && config.description[CurrentLanguage]
            ? config.description[CurrentLanguage]
            : null,
          config.guide && config.guide[CurrentLanguage]
            ? config.guide[CurrentLanguage]
            : null,
        ];
        api.sendMessage(
          getLang("command", config.name, description, guide),
          event.threadID,
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
        getLang(
          "listCommand",
          commandCount + noprefixCount,
          commandCount,
          msgPrefix,
          noprefixCount,
          msgNpPrefix,
        ),
        event.threadID,
      );
    }
  }
}
