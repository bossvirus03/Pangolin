import { CustomLogger } from "../logger/log";
import { readdirSync } from "fs";
import { join } from "path";
import * as tsNode from "ts-node";

class HandleCommand {
  constructor(private client: any) {}

  load() {
    const Log = new CustomLogger();
    const commandPath = join(process.cwd(), "src", "modules", "commands");

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

  async checkPermission(
    client: any,
    api: any,
    event: any,
    config: any,
    args: any,
    PREFIX: string,
  ) {
    const ADMINS = config.admins;
    const commandPath = join(process.cwd(), "src", "modules", "commands");
    const commandFiles = readdirSync(commandPath).filter((file: string) =>
      file.endsWith(".ts"),
    );
    for (const file of commandFiles) {
      const filePath = join(commandPath, file);
      const CommandClass = require(filePath).default;
      if (!CommandClass) continue;
      const { config } = CommandClass;
      const commandInstance = new CommandClass(client);
      if (commandInstance.run) {
        if (config.name == args[0]) {
          // check permissions group admin
          if (config.permission == 1) {
            try {
              const info: { adminIDs: { id: string }[] } = await new Promise(
                (resolve, reject) => {
                  api.getThreadInfo(event.threadID, (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                  });
                },
              );
              const checkIsPermission = info.adminIDs.some(
                (item) => item.id == event.senderID,
              );
              const isAdminBot = ADMINS.includes(event.senderID);
              if (isAdminBot) return true;
              if (checkIsPermission) {
                return true;
              } else {
                await api.sendMessage(
                  global.getLang("Unauthorized", PREFIX, config.name),
                  event.threadID,
                );
                return false;
              }
            } catch (error) {
              global.getLang("ErrorOccurred", error);

              return false;
            }
          }
          // check permissions for admin bot
          else if (
            config.permission == 2 &&
            (event.body as string).startsWith(PREFIX)
          ) {
            let isPermission = true;
            let isAdmin = 0;
            for (let id of ADMINS) {
              if (id != event.senderID) {
                isAdmin++;
              }
            }
            if (isAdmin == ADMINS.length) {
              api.sendMessage(
                global.getLang("Unauthorized", PREFIX, config.name),
                event.threadID,
              );
              isPermission = false;
            }
            return isPermission;
          } else {
            return true;
          }
        }
      }
    }
  }
}

export default HandleCommand;
export const loadCommands = (client: any) => {
  const handler = new HandleCommand(client);
  handler.load();
};

export const checkPermission = async (
  client: any,
  api: any,
  event: any,
  config: any,
  args: any,
  PREFIX: string,
) => {
  const handler = new HandleCommand(client);
  return await handler.checkPermission(
    client,
    api,
    event,
    config,
    args,
    PREFIX,
  );
};
