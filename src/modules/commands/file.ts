import * as fs from "fs";
import { join } from "path";
import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
import * as cache from "memory-cache";
export default class FileCommand {
  static config = {
    category: "ADMIN",
    name: "file",
    version: "",
    author: "",
    permission: 2,
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };

  constructor(private client) {}

  async getFolderSize(folderPath) {
    let totalSize = 0;
    const items = await fs.promises.readdir(folderPath);
    for (const item of items) {
      const itemPath = join(folderPath, item);
      const stats = await fs.promises.stat(itemPath);
      if (stats.isDirectory()) {
        totalSize += await this.getFolderSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

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
    try {
      const rootDirectory = process.cwd();
      let msg = "";
      const items = await fs.promises.readdir(rootDirectory);
      for (const item of items) {
        const itemPath = join(rootDirectory, item);
        const stats = await fs.promises.stat(itemPath);
        if (stats.isDirectory()) {
          msg += `📁 ${item} - ${this.formatBytes(await this.getFolderSize(itemPath))}\n`;
        } else {
          msg += `📄 ${item} - ${this.formatBytes(stats.size)}\n`;
        }
      }
      await api.sendMessage(msg, event.threadID, (err, info) => {
        cache.put("file", {
          messageID: info.messageID,
          path: rootDirectory,
        });
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async event({ api, event }: IPangolinListenEvent) {
    if (event.type === "message_reply") {
      const file = cache.get("file");
      if (!file) return;

      if (file.messageID && event.messageReply.messageID == file.messageID) {
        const fileNeedGet = event.body as string;
        if (fileNeedGet === "appstate.json" || fileNeedGet === ".env")
          return api.sendMessage(
            "Không cho đâuuu",
            event.threadID,
            () => {},
            event.messageID,
          );
        const directory = file.path;
        const items = await fs.promises.readdir(directory);
        if (!items.includes(fileNeedGet))
          return api.sendMessage("File not found", event.threadID);
        api.unsendMessage(event.messageReply.messageID);
        for (const item of items) {
          if (fileNeedGet == item) {
            const itemPath1 = join(directory, item);
            const stats = await fs.promises.stat(itemPath1);
            if (stats.isDirectory()) {
              const items = await fs.promises.readdir(itemPath1);
              let msg = "";
              for (const item of items) {
                const itemPath = join(itemPath1, item);
                if (item == "main.ts") continue;
                const stats = await fs.promises.stat(itemPath);
                if (stats.isDirectory()) {
                  msg += `📁 ${item} - ${this.formatBytes(await this.getFolderSize(itemPath))}\n`;
                } else {
                  msg += `📄 ${item} - ${this.formatBytes(stats.size)}\n`;
                }
              }
              api.sendMessage(msg, event.threadID, (err, info) => {
                cache.put("file", {
                  messageID: info.messageID,
                  path: itemPath1,
                });
              });
            } else {
              const fileContent = fs.readFileSync(itemPath1, "utf8");
              const pathOutput = join(
                process.cwd(),
                `/public/files/${fileNeedGet}.txt`,
              );
              fs.writeFileSync(pathOutput, fileContent),
                api.sendMessage(
                  {
                    attachment: fs.createReadStream(pathOutput),
                  },
                  event.threadID,
                );
              // msg += `📄 ${item} - ${this.formatBytes(stats.size)}\n`;
            }
          }
        }
      }
    }
    try {
    } catch (error) {}
  }
}
