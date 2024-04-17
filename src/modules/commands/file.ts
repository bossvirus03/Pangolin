import * as fs from "fs";
import { join } from "path";

export default class FileCommand {
  static config = {
    name: "file",
    version: "",
    author: "",
    createdAt: "",
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
  }) {
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
      await api.sendMessage(msg, event.threadID);
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
