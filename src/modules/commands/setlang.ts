import { IPangolinRun } from "src/types/type.pangolin-handle";
import * as fs from "fs";
import { join } from "path";

export default class SetLangName {
  static config = {
    name: "setlang", //your command name
    version: "1.0.0",
    author: "Lợi",
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
  async run({ api, event, args }: IPangolinRun) {
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
      await api.sendMessage(`Đã đổi ngôn ngữ thành ${args[1]}`, event.threadID);
    } else {
      api.sendMessage("chỉ 'en' hoặc 'vi'!", event.threadID);
    }
  }
}
