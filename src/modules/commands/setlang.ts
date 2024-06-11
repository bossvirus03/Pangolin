import { IPangolinRun } from "src/types/type.pangolin-handle";
import * as fs from "fs";
import { join } from "path";

export default class SetLangName {
  static config = {
    name: "setlang", //your command name
    version: "1.0.0",
    author: "Lợi",
    category: "ADMIN",
    permission: 2,
    description: {
      vi: "Đổi ngôn ngữ bot",
      en: "Change bot language",
    },
    guide: {
      vi: "[prefix]setlang [vi/en]",
      en: "[prefix]setlang [vi/en]",
    },
  };

  static message = {
    vi: {
      successChange: "Đã đổi ngôn ngữ thành $0",
      errorGuide: "Chỉ 'en' hoặc 'vi'!",
    },
    en: {
      successChange: "Success change bot language to $0",
      errorGuide: "Just 'en' or 'vi'",
    },
  };

  constructor(private client) {}
  async run({ api, event, args, getLang }: IPangolinRun) {
    const configPath = join(process.cwd(), "pangolin.config.json");
    let dataConfig = fs.readFileSync(configPath, "utf8");
    let config = JSON.parse(dataConfig);

    const lang = ["vi", "en"];
    if (lang.includes(args[1])) {
      fs.writeFileSync(
        configPath,
        JSON.stringify({
          ...config,
          lang,
        }),
        {
          encoding: "utf-8",
        },
      );
      await api.sendMessage(getLang("successChange", args[1]), event.threadID);
    } else {
      api.sendMessage(getLang("errorGuide"), event.threadID);
    }
  }
}
