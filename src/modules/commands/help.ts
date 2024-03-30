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
    description: {
      vi: "xem bot có bao nhiêu lệnh or xem hướng dẫn cách dùng của 1 lệnh nào đó",
      en: "xem bot có bao nhiêu lệnh or xem hướng dẫn cách dùng của 1 lệnh nào đó",
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
      listCommand: "",
      command: "",
    },
  };

  constructor(private client) {}

  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang
  ) {
    const CurrentLanguage = process.env.LANGUAGE_CODE || "en";
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
        getLang(
          "listCommand",
          commandCount + noprefixCount,
          commandCount,
          msgPrefix,
          noprefixCount,
          msgNpPrefix
        ),
        event.threadID
      );
    }
  }
}
