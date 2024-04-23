import { CustomLogger } from "../logger/log";
import { readdirSync } from "fs";
import { join } from "path";
import * as tsNode from "ts-node";

class HandleCommand {
  constructor(private client: any) {}

  load() {
    const Log = new CustomLogger();
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
          Log.warn(
            `Error loading command from file ${file}: Invalid command structure`,
          );
          continue;
        }

        const { config } = CommandClass;

        if (!config || !config.name) {
          Log.warn(
            `Error loading command from file ${file}: Command name is undefined`,
          );
          continue;
        }

        const commandInstance = new CommandClass(this.client);
        //execute command when prefix is ​​present
        if (commandInstance.run) {
          commandCount++;
          this.client.commands.set(config.name, commandInstance);
        }

        // execute command without prefix
        if (commandInstance.noprefix) {
          noprefixCount++;
          this.client.noprefix.set(config.name, commandInstance);
        }

        // execute command for all event
        if (commandInstance.handleEvent) {
          this.client.handleEvent.set(config.name, commandInstance);
        }

        // execute command for all reply event
        if (commandInstance.handleReply) {
          this.client.handleReply.set(config.name, commandInstance);
        }

        // execute command for all reaction event
        if (commandInstance.handleReaction) {
          this.client.handleReaction.set(config.name, commandInstance);
        }

        // command execution as each command id loaded
        if (commandInstance.onload) {
          this.client.onload.push(commandInstance);
        }
      } catch (error) {
        Log.warn(`Error loading command from file ${file}: ${error}`);
      }
    }

    Log.rainbow(
      global.getLang("LoadCommandCount", commandCount, noprefixCount),
    );
  }
}

export default HandleCommand;
