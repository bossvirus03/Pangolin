import { CustomLogger } from "@CustomLog";
import { IPangolinRun } from "src/types/type.pangolin-handle";
import HandleCommand, { loadCommands } from "src/core/handleCommand";

export default class ClassName {
  static config = {
    name: "cmd", // your command name
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
      missingFileName: "df",
      text2: "",
    },
    en: {
      missingFileName: "df",
      text2: "",
    },
  };

  constructor(private client) {}

  async run({ args, api, event }: IPangolinRun) {
    if (args[1] == "loadAll") {
      api.sendMessage("Loading...", event.threadID, event.messageID);
      await loadCommands(this.client);
      api.sendMessage("done!", event.threadID, event.messageID);
    }
  }
}
