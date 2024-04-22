import { readdirSync } from "fs";
import * as fs from "fs";
import { join } from "path";
import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class RankUpCommand {
  static config = {
    category: "GROUP",
    name: "rankup",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Bật tắt thông báo khi tăng cấp độ tương tác",
      en: "Toggle notifications when interaction level increases",
    },
    guide: {
      vi: "[prefix]rankup [on/off]",
      en: "[prefix]rankup [on/off]",
    },
  };

  static message = {
    vi: {
      on: "Đã bật thông báo khi tăng cấp độ tương tác",
      off: "Đã tắt thông báo khi tăng cấp độ tương tác",
      info: "Chúc mừng @0 đã tăng cấp",
    },
    en: {
      on: "Enabled notifications when interaction level increases",
      off: "Disabled notifications when interaction level increases",
      info: "Congratulations @$0 on your level up",
    },
  };
  constructor(private client) {}
  async event({
    api,
    event,
    client,
    UserData,
    ThreadData,
    getLang,
  }: IPangolinListenEvent) {
    if (!event.senderID) return;
    if (!event.isGroup) return;
    const thread = (await ThreadData.rankup.get(event.threadID)) || null;
    if (!thread) return;
    const user = await UserData.get(event.senderID);
    if (!user) return;
    const currentLevel = Math.floor(Math.sqrt(1 + (4 * user.exp) / 3 + 1) / 2);
    const level = Math.floor(Math.sqrt(1 + (4 * (user.exp + 1)) / 3 + 1) / 2);
    function getRandomGif(arr) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      const item = arr[randomIndex];
      return item;
    }
    const gifPath = join(process.cwd(), "src", "db", "data", "rank", "gif");
    const listGif = readdirSync(gifPath).filter((file: string) =>
      file.endsWith(".gif"),
    );
    const randomGif = getRandomGif(listGif);
    if (level - currentLevel == 1 && level != 1) {
      return api.sendMessage(
        {
          body: getLang("info", user.name),
          mentions: [
            {
              tag: `@${user.name}`,
              id: event.senderID,
              fromIndex: 9,
            },
          ],
          attachment: fs.createReadStream(join(gifPath + "/" + randomGif)),
        },
        event.threadID,
      );
    }
  }

  async run({ api, event, args, getLang, ThreadData }: IPangolinRun) {
    if (args[1] == "on") {
      await ThreadData.rankup.set(event.threadID, true);
      api.sendMessage(getLang("on"), event.threadID);
    }
    if (args[1] == "off") {
      await ThreadData.rankup.set(event.threadID, false);
      api.sendMessage(getLang("off"), event.threadID);
    }
  }
}
