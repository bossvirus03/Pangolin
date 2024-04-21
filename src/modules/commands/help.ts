import { readdirSync } from "fs";
import { join } from "path";
import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
import * as cache from "memory-cache";
export default class HelpCommand {
  static config = {
    category: "GROUP",
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
        "This is a Facebook chat message. Currently, this bot has $0 commands\n\n$1 commands has prefix : $2\n\n$3 no prefix: $4",
      command: "------$0-------\nChức Năng: $1\nCách dùng: $2",
      invalidPage: "Trang không hợp lệ!",
      listCommandPaginate:
        "$0 \n\n\nTrang [$1/$2]\nReply số trang để xem tiếp!",
    },
    en: {
      listCommand:
        "This is a Facebook chat message. Currently, this bot has $0 commands\n\n$1 commands has prefix : $2\n\n$3 no prefix: $4",
      command: "------$0-------\nFunction: $1\nUse: $2",
      invalidPage: "Invalid page!",
      listCommandPaginate:
        "$0 \n\n\nPage [$1/$2]\nReply page number to continue reading!",
    },
  };

  constructor(private client) {}
  commandPath = join(process.cwd(), "src", "modules", "commands");
  commandFiles = readdirSync(this.commandPath).filter((file: string) =>
    file.endsWith(".ts"),
  );
  CurrentLanguage = process.env.LANGUAGE_CODE || "en";
  getAllCommand(api, event, args, getLang) {
    let commandInCategory = [];
    let commandInCategoryNoPrefix = [];
    let commandCount = 0;
    let noprefixCount = 0;
    let allCommand = [];
    for (const file of this.commandFiles) {
      const filePath = join(this.commandPath, file);
      const CommandClass = require(filePath).default;
      if (!CommandClass) continue;
      const { config } = CommandClass;
      const commandInstance = new CommandClass(this.client);
      if (args[1] == config.name) {
        const [description, guide] = [
          config.description && config.description[this.CurrentLanguage]
            ? config.description[this.CurrentLanguage]
            : null,
          config.guide && config.guide[this.CurrentLanguage]
            ? config.guide[this.CurrentLanguage]
            : null,
        ];
        api.sendMessage(
          getLang("command", config.name, description, guide),
          event.threadID,
        );
      }
      if (commandInstance.run) {
        allCommand.push({ config });
        commandInCategory.push({
          category: config.category,
          name: config.name,
        });
        commandCount++;
      }
      if (commandInstance.noprefix) {
        commandInCategoryNoPrefix.push({
          category: config.category,
          name: config.name,
        });
        noprefixCount++;
      }
    }
    return {
      allCommand,
      commandInCategory,
      commandInCategoryNoPrefix,
      commandCount,
      noprefixCount,
    };
  }
  paginate(data, currentPage, pageSize, api, event) {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
    const itemsOnPage = data.slice(startIndex, endIndex + 1);

    return {
      totalPages,
      currentPage,
      pageSize,
      totalItems,
      itemsOnPage,
    };
  }

  async sendMessagePaginate(
    message,
    currentPage,
    totalPages,
    api,
    event,
    getLang,
  ) {
    const messageID: any = await new Promise((resolve, reject) => {
      api.sendMessage(
        getLang("listCommandPaginate", message, currentPage, totalPages),
        event.threadID,
        (err, info) => {
          if (err) reject(err);
          else resolve(info.messageID);
        },
      );
    });
    cache.put("help", messageID);
  }
  async event({ event, api, getLang }: IPangolinListenEvent) {
    if (event.type === "message_reply") {
      const messageID = cache.get("help");
      if (messageID && event.messageReply.messageID == messageID) {
        const { allCommand } = this.getAllCommand(api, event, "", getLang);
        const paginatedData = this.paginate(
          allCommand,
          event.body,
          10,
          api,
          event,
        );
        if (parseInt(event.body as string) > paginatedData.totalPages) {
          return api.sendMessage(
            getLang("InvalidPage"),
            event.threadID,
            () => {},
            event.messageID,
          );
        }
        let message = "";
        if (paginatedData) {
          paginatedData.itemsOnPage.forEach((item) => {
            const [description, guide] = [
              item.config.description &&
              item.config.description[this.CurrentLanguage]
                ? item.config.description[this.CurrentLanguage]
                : null,
              item.config.guide && item.config.guide[this.CurrentLanguage]
                ? item.config.guide[this.CurrentLanguage]
                : null,
            ];
            message += `\n\n[${item.config.name}]\nVersion: ${item.config.version}\nDescription:${description}\nGuide: ${guide}`;
          });
          this.sendMessagePaginate(
            message,
            paginatedData.currentPage,
            paginatedData.totalPages,
            api,
            event,
            getLang,
          );
        }

        return;
      }
    }
  }
  async run({ api, event, args, getLang, pangolin }: IPangolinRun) {
    let msgPrefix = "";
    let msgNpPrefix = "";
    // ============================= PAGINATE =============================
    if (pangolin.help_paginate) {
      const { allCommand } = this.getAllCommand(api, event, args, getLang);
      const paginatedData = this.paginate(allCommand, 1, 10, api, event);
      let message = "";
      paginatedData.itemsOnPage.forEach((item) => {
        const [description, guide] = [
          item.config.description &&
          item.config.description[this.CurrentLanguage]
            ? item.config.description[this.CurrentLanguage]
            : null,
          item.config.guide && item.config.guide[this.CurrentLanguage]
            ? item.config.guide[this.CurrentLanguage]
            : null,
        ];
        message += `\n\n[${item.config.name}]\nVersion: ${item.config.version}\nDescription:${description}\nGuide: ${guide}`;
      });
      this.sendMessagePaginate(
        message,
        paginatedData.currentPage,
        paginatedData.totalPages,
        api,
        event,
        getLang,
      );
      return;
    }
    // ============================= DEFAULT =============================
    let groupedItems = [];
    const {
      allCommand,
      commandInCategory,
      commandInCategoryNoPrefix,
      commandCount,
      noprefixCount,
    } = this.getAllCommand(api, event, args, getLang);

    commandInCategory.forEach((item) => {
      const index = groupedItems.findIndex(
        (group) => group.category === item.category,
      );
      if (index !== -1) {
        groupedItems[index].items.push(item.name);
      } else {
        groupedItems.push({
          category: item.category,
          items: [item.name],
        });
      }
    });
    let groupedItemsNoprefix = [];
    commandInCategoryNoPrefix.forEach((item) => {
      const index = groupedItemsNoprefix.findIndex(
        (group) => group.category === item.category,
      );
      if (index !== -1) {
        groupedItemsNoprefix[index].items.push(item.name);
      } else {
        groupedItemsNoprefix.push({
          category: item.category,
          items: [item.name],
        });
      }
    });

    groupedItems.forEach((groupedItem) => {
      msgPrefix += `\n-------${groupedItem.category}-------\n${groupedItem.items.join(", ")}\n`;
    });
    groupedItemsNoprefix.forEach((groupedItem) => {
      msgNpPrefix += `${groupedItem.items.join(", ")}\n`;
    });
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
