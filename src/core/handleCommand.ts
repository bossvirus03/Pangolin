import { CustomLogger } from "../logger/log";
import { readdirSync } from "fs";
import { join } from "path";
import * as tsNode from "ts-node";

class HandleCommand {
  private Log: CustomLogger;
  private commandPath: string;

  static commandCount = 0;
  static noprefixCount = 0;
  constructor(private client: any) {
    this.Log = new CustomLogger();
    this.commandPath = join(process.cwd(), "src", "modules", "commands");
    tsNode.register({ transpileOnly: true });
  }

  load() {
    const commandFiles = this.getCommandFiles();

    commandFiles.forEach((file) => {
      const commandInstance = this.loadCommand(file);
      if (!commandInstance) return;

      const { config } = commandInstance.constructor;
      this.registerCommand(
        commandInstance,
        config,
        HandleCommand.commandCount,
        HandleCommand.noprefixCount,
      );
    });

    this.Log.rainbow(
      global.getLang(
        "LoadCommandCount",
        HandleCommand.commandCount,
        HandleCommand.noprefixCount,
      ),
    );
  }

  private getCommandFiles(): string[] {
    return readdirSync(this.commandPath).filter((file) => file.endsWith(".ts"));
  }

  private loadCommand(file: string) {
    try {
      const filePath = join(this.commandPath, file);
      delete require.cache[require.resolve(filePath)]; // Clear the require cache
      const CommandClass = require(filePath).default;
      if (!CommandClass || !CommandClass.config) {
        this.Log.warn(
          `Error loading command from file ${file}: Invalid command structure`,
        );
        return null;
      }
      return new CommandClass(this.client);
    } catch (error) {
      this.Log.warn(`Error loading command from file ${file}: ${error}`);
      return null;
    }
  }

  private registerCommand(
    commandInstance: any,
    config: any,
    commandCount: number,
    noprefixCount: number,
  ) {
    if (!config || !config.name) {
      this.Log.warn(`Error loading command: Command name is undefined`);
      return;
    }

    if (commandInstance.run) {
      commandCount++;
      this.client.commands.set(config.name, commandInstance);
    }

    if (commandInstance.noprefix) {
      noprefixCount++;
      this.client.noprefix.set(config.name, commandInstance);
    }

    if (commandInstance.handleEvent) {
      this.client.handleEvent.set(config.name, commandInstance);
    }

    if (commandInstance.handleReply) {
      this.client.handleReply.set(config.name, commandInstance);
    }

    if (commandInstance.handleReaction) {
      this.client.handleReaction.set(config.name, commandInstance);
    }

    if (commandInstance.onload) {
      this.client.onload.push(commandInstance);
    }
  }

  async checkPermission(
    client: any,
    api: any,
    event: any,
    config: any,
    args: any,
    PREFIX: string,
  ): Promise<boolean> {
    const ADMINS = config.admins;
    const commandFiles = this.getCommandFiles();

    for (const file of commandFiles) {
      const commandInstance = this.loadCommand(file);
      if (!commandInstance) continue;

      const { config } = commandInstance.constructor;
      if (config.name === args[0] && commandInstance.run) {
        return this.hasPermission(api, event, config, ADMINS, PREFIX);
      }
    }

    return true;
  }

  private async hasPermission(
    api: any,
    event: any,
    config: any,
    ADMINS: string[],
    PREFIX: string,
  ): Promise<boolean> {
    try {
      if (config.permission === 1) {
        const info = await this.getThreadInfo(api, event.threadID);
        const isAdmin = ADMINS.includes(event.senderID);
        const isGroupAdmin = info.adminIDs.some(
          (item) => item.id === event.senderID,
        );

        if (isAdmin || isGroupAdmin) return true;

        await api.sendMessage(
          global.getLang("Unauthorized", PREFIX, config.name),
          event.threadID,
        );
        return false;
      }

      if (config.permission === 2 && event.body.startsWith(PREFIX)) {
        if (ADMINS.includes(event.senderID)) return true;

        await api.sendMessage(
          global.getLang("Unauthorized", PREFIX, config.name),
          event.threadID,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.Log.warn(`Error checking permission: ${error}`);
      return false;
    }
  }

  private getThreadInfo(
    api: any,
    threadID: string,
  ): Promise<{ adminIDs: { id: string }[] }> {
    return new Promise((resolve, reject) => {
      api.getThreadInfo(threadID, (err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });
  }
}

export default HandleCommand;
export const loadCommands = (client: any) => {
  new HandleCommand(client).load();
};

export const checkPermission = async (
  client: any,
  api: any,
  event: any,
  config: any,
  args: any,
  PREFIX: string,
) => {
  return await new HandleCommand(client).checkPermission(
    client,
    api,
    event,
    config,
    args,
    PREFIX,
  );
};
