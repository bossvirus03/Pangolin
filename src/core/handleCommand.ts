import { ConsoleLogger, Logger } from "@nestjs/common";
import { readdirSync } from "fs";
import { join } from "path";
import * as tsNode from "ts-node";

class HandleCommand {
  constructor(private client: any) {}

  load() {
    const commandPath = join(process.cwd(), "src", "modules", "commands");

    // Configure ts-node to transpile TypeScript files on the fly
    tsNode.register({
      transpileOnly: true,
    });

    const commandFiles = readdirSync(commandPath).filter((file: string) =>
      file.endsWith(".ts"),
    );
    let commandCount = 0;
    let noprefixCount = 0;
    for (const file of commandFiles) {
      try {
        const filePath = join(commandPath, file);
        const CommandClass = require(filePath).default;

        if (!CommandClass || !CommandClass.config) {
          console.log(
            `Error loading command from file ${file}: Invalid command structure`
              .yellow,
          );
          continue;
        }

        const { config } = CommandClass;

        if (!config || !config.name) {
          console.error(
            `Error loading command from file ${file}: Command name is undefined`,
          );
          continue;
        }

        const commandInstance = new CommandClass(this.client);
        if (commandInstance.run) {
          commandCount++;
          this.client.commands.set(config.name, commandInstance);
        }

        if (commandInstance.event) {
          this.client.event.set(config.name, commandInstance);
        }

        if (commandInstance.noprefix) {
          noprefixCount++;
          this.client.noprefix.set(config.name, commandInstance);
        }

        if (commandInstance.onload) {
          this.client.onload.push(commandInstance);
        }
      } catch (error) {
        console.error(`Error loading command from file ${file}:`, error);
      }
    }

    console.log(
      global.getLang("LoadCommandCount", commandCount, noprefixCount).rainbow,
    );
  }
}

export default HandleCommand;
