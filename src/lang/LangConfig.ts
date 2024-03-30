import { readdirSync } from "fs";
import { join } from "path";

export default class ConfigGuideLang {
  constructor(
    private client,
    private command
  ) {}
  getLang(key, args) {
    const CurrentLanguage = process.env.LANGUAGE_CODE || "en";
    const eventPath = join(process.cwd(), "src", "modules", "events");
    const eventFiles = readdirSync(eventPath).filter((file: string) =>
      file.endsWith(".ts")
    );
    const commandPath = join(process.cwd(), "src", "modules", "commands");
    const commandFiles = readdirSync(commandPath).filter((file: string) =>
      file.endsWith(".ts")
    );
    for (const file of commandFiles) {
      const filePath = join(commandPath, file);
      const CommandClass = require(filePath).default;
      if (!CommandClass) continue;
      const { message } = CommandClass;
      const { config } = CommandClass;
      if (this.command == config.name) {
        let text = message[CurrentLanguage][key];
        args.forEach((key, index) => {
          text = text.replace(`\$${index}`, args[index]);
        });
        return text;
      }
    }
    for (const file of eventFiles) {
      const filePath = join(eventPath, file);
      const EventClass = require(filePath).default;
      if (!EventClass) continue;
      const { message } = EventClass;
      const { config } = EventClass;
      if (this.command == config.name) {
        if (!message) return null;
        let text = message[CurrentLanguage][key];
        args.forEach((key, index) => {
          text = text.replace(`\$${index}`, args[index]);
        });
        return text;
      }
    }
  }
}
