import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as fs from "fs";
import { join } from "path";

export default class FileCommand {
  static config = {
    name: "file", //your command name
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

  async run({
    api,
    event,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang,
  }) {
    function getFolderSize(folderPath) {
      let totalSize = 0;
      const items = fs.readdirSync(folderPath);
      items.forEach((item) => {
        const itemPath = join(folderPath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          totalSize += getFolderSize(itemPath);
        } else {
          totalSize += stats.size;
        }
      });

      return totalSize;
    }

    function formatBytes(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    const rootDirectory = process.cwd();
    let msg = "";
    const items = fs.readdirSync(rootDirectory);
    items.forEach((item) => {
      const itemPath = join(rootDirectory, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        msg += `📁 ${item} - ${formatBytes(getFolderSize(itemPath))}\n`;
      } else {
        msg += `📄 ${item} - ${formatBytes(stats.size)}\n`;
      }
    });
    api.sendMessage(msg, event.threadID);
  }
}
