import { Logger } from "@nestjs/common";
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
      file.endsWith(".ts")
    );

    commandFiles.forEach((file) => {
      const logger = new Logger(); // Create an instance of the Logger
      logger.log(`Loaded event file: {${file}}`);
    });
    let commandCount = 0;
    let noprefixCount = 0;
    for (const file of commandFiles) {
      try {
        const filePath = join(commandPath, file);
        const CommandClass = require(filePath).default;

        if (!CommandClass || !CommandClass.config) {
          console.error(
            `Error loading command from file ${file}: Invalid command structure`
          );
          continue;
        }

        const { config } = CommandClass;

        if (!config || !config.name) {
          console.error(
            `Error loading command from file ${file}: Command name is undefined`
          );
          continue;
        }

        const commandInstance = new CommandClass(this.client);
        if (commandInstance.run) {
          commandCount++;
          this.client.commands.set(config.name, commandInstance);
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

    console.log(`Loaded ${commandCount} commands, ${noprefixCount} noprefix`);
  }
}

export default HandleCommand;
